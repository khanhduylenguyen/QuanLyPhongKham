import { useEffect, useRef, useState } from "react";
import { TelemedicineSignaling, TelemedicineSignalMessage } from "@/lib/telemedicine/signaling";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Video, VideoOff, Mic, MicOff, PhoneOff, MessageSquare } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

type Props = {
  roomId: string;
};

type ChatMessage = {
  id: string;
  from: string;
  content: string;
  self: boolean;
  timestamp: number;
};

const rtcConfig: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const TelemedicineRoom = ({ roomId }: Props) => {
  const user = getCurrentUser();
  const [connected, setConnected] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isCreatingOffer, setIsCreatingOffer] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const signalingRef = useRef<TelemedicineSignaling | null>(null);
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    const signaling = new TelemedicineSignaling(roomId, handleSignal);
    signalingRef.current = signaling;

    // Announce presence in room
    signaling.send("system", user.id, { action: "join" });

    return () => {
      endCall();
      signaling.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user?.id]);

  const appendChat = (msg: ChatMessage) => {
    setChatMessages((prev) => [...prev, msg]);
  };

  const handleSignal = async (msg: TelemedicineSignalMessage) => {
    if (!user || msg.from === user.id) return;

    if (msg.type === "chat") {
      appendChat({
        id: `${msg.timestamp}`,
        from: msg.payload.fromName || "Người dùng",
        content: msg.payload.text,
        self: false,
        timestamp: msg.timestamp,
      });
      return;
    }

    if (msg.type === "system" && msg.payload?.action === "join") {
      // Another peer joined. If we are already in the room and not in a call, we can start offer.
      if (!pcRef.current && joinedRef.current) {
        await startCall(true);
      }
      return;
    }

    if (msg.type === "offer") {
      await ensurePeerConnection();
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(msg.payload));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      signalingRef.current?.send("answer", user.id, answer);
      setConnected(true);
      return;
    }

    if (msg.type === "answer") {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(msg.payload));
      setConnected(true);
      return;
    }

    if (msg.type === "ice") {
      if (!pcRef.current) return;
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(msg.payload));
      } catch (error) {
        console.error("Error adding received ICE candidate", error);
      }
      return;
    }
  };

  const ensurePeerConnection = async () => {
    if (pcRef.current) return;

    const pc = new RTCPeerConnection(rtcConfig);
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && user) {
        signalingRef.current?.send("ice", user.id, event.candidate);
      }
    };

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    if (!localStreamRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        stream.getVideoTracks().forEach((t) => (t.enabled = cameraOn));
        stream.getAudioTracks().forEach((t) => (t.enabled = micOn));
      } catch (error) {
        console.error("Không thể truy cập camera/micro:", error);
        return;
      }
    }

    localStreamRef.current.getTracks().forEach((track) => {
      if (localStreamRef.current) {
        pc.addTrack(track, localStreamRef.current);
      }
    });
  };

  const startCall = async (asCaller: boolean) => {
    if (!user || isCreatingOffer) return;
    joinedRef.current = true;
    await ensurePeerConnection();
    if (!pcRef.current) return;

    if (asCaller) {
      try {
        setIsCreatingOffer(true);
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        signalingRef.current?.send("offer", user.id, offer);
      } catch (error) {
        console.error("Error creating offer", error);
      } finally {
        setIsCreatingOffer(false);
      }
    }
  };

  const endCall = () => {
    setConnected(false);
    joinedRef.current = false;
    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  const toggleCamera = () => {
    setCameraOn((prev) => {
      const next = !prev;
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = next));
      }
      return next;
    });
  };

  const toggleMic = () => {
    setMicOn((prev) => {
      const next = !prev;
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = next));
      }
      return next;
    });
  };

  const handleSendChat = () => {
    if (!user || !chatInput.trim()) return;
    const msg: ChatMessage = {
      id: `${Date.now()}`,
      from: user.name,
      content: chatInput.trim(),
      self: true,
      timestamp: Date.now(),
    };
    appendChat(msg);
    signalingRef.current?.send("chat", user.id, {
      text: msg.content,
      fromName: user.name,
    });
    setChatInput("");
  };

  const canJoin = !!user;

  return (
    <Card className="border-[#E5E7EB]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Tư vấn Trực tuyến (Telemedicine)</span>
          <span className="text-xs text-[#687280]">
            Phòng: <span className="font-mono">{roomId}</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!canJoin && (
          <div className="rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 mb-4 text-sm">
            Vui lòng đăng nhập để sử dụng tính năng tư vấn trực tuyến.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative rounded-lg bg-black overflow-hidden h-56 md:h-64">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!cameraOn && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-sm bg-black/70">
                    <VideoOff className="h-6 w-6 mr-2" />
                    Camera đang tắt
                  </div>
                )}
                <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                  Bạn
                </div>
              </div>
              <div className="relative rounded-lg bg-black overflow-hidden h-56 md:h-64">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!connected && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-sm bg-black/70">
                    <Video className="h-6 w-6 mb-2" />
                    Đang chờ kết nối với bên còn lại...
                  </div>
                )}
                <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                  Bệnh nhân / Bác sĩ
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={cameraOn ? "default" : "outline"}
                onClick={toggleCamera}
                disabled={!canJoin}
              >
                {cameraOn ? (
                  <>
                    <Video className="h-4 w-4 mr-2" />
                    Tắt camera
                  </>
                ) : (
                  <>
                    <VideoOff className="h-4 w-4 mr-2" />
                    Bật camera
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant={micOn ? "default" : "outline"}
                onClick={toggleMic}
                disabled={!canJoin}
              >
                {micOn ? (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Tắt micro
                  </>
                ) : (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    Bật micro
                  </>
                )}
              </Button>
              <Button
                size="sm"
                className="bg-[#16a34a] hover:bg-[#15803d]"
                onClick={() => startCall(true)}
                disabled={!canJoin || isCreatingOffer}
              >
                <Video className="h-4 w-4 mr-2" />
                {connected ? "Đang kết nối" : isCreatingOffer ? "Đang tạo kết nối..." : "Bắt đầu cuộc gọi"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={endCall}
                disabled={!connected}
              >
                <PhoneOff className="h-4 w-4 mr-2" />
                Kết thúc
              </Button>
            </div>

            <p className="text-xs text-[#687280]">
              Lưu ý: Bản demo sử dụng kết nối WebRTC đơn giản và BroadcastChannel, hoạt động tốt nhất khi bác sĩ
              và bệnh nhân mở hệ thống trên 2 tab/trình duyệt khác nhau trên cùng máy trong môi trường demo.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <MessageSquare className="h-4 w-4 text-[#007BFF]" />
              Trao đổi nhanh
            </div>
            <div className="border border-[#E5E7EB] rounded-lg flex flex-col h-72">
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-2 text-sm">
                  {chatMessages.length === 0 && (
                    <p className="text-xs text-[#9CA3AF]">
                      Tin nhắn sẽ xuất hiện ở đây. Hãy sử dụng để ghi chú nhanh hoặc gửi hướng dẫn cho bệnh nhân.
                    </p>
                  )}
                  {chatMessages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.self ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-1.5 ${
                          m.self
                            ? "bg-[#007BFF] text-white"
                            : "bg-[#F3F4F6] text-gray-900"
                        }`}
                      >
                        <div className="text-[10px] opacity-80 mb-0.5">
                          {m.self ? "Bạn" : m.from}
                        </div>
                        <div>{m.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="border-t border-[#E5E7EB] p-2">
                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  rows={2}
                  className="text-sm resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChat();
                    }
                  }}
                  disabled={!canJoin}
                />
                <div className="flex justify-end mt-1">
                  <Button
                    size="sm"
                    className="bg-[#007BFF] hover:bg-[#0056B3]"
                    onClick={handleSendChat}
                    disabled={!canJoin || !chatInput.trim()}
                  >
                    Gửi
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TelemedicineRoom;


