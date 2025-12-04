export type TelemedicineSignalType = "offer" | "answer" | "ice" | "chat" | "system";

export type TelemedicineSignalMessage = {
  type: TelemedicineSignalType;
  from: string;
  payload: any;
  timestamp: number;
};

/**
 * Simple signaling layer using BroadcastChannel.
 * NOTE: This works between tabs/windows on the SAME browser for demo purposes.
 * For real deployment you should replace this with a WebSocket-based signaling server.
 */
export class TelemedicineSignaling {
  private channel: BroadcastChannel | null = null;
  private readonly roomId: string;
  private readonly onMessage: (msg: TelemedicineSignalMessage) => void;

  constructor(roomId: string, onMessage: (msg: TelemedicineSignalMessage) => void) {
    this.roomId = roomId;
    this.onMessage = onMessage;

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.channel = new BroadcastChannel(`cliniccare:telemedicine:${roomId}`);
      this.channel.onmessage = (event) => {
        const data = event.data as TelemedicineSignalMessage;
        if (!data) return;
        this.onMessage(data);
      };
    } else {
      console.warn("BroadcastChannel not supported in this browser. Telemedicine demo will be limited.");
    }
  }

  send(type: TelemedicineSignalType, from: string, payload: any) {
    if (!this.channel) return;
    const message: TelemedicineSignalMessage = {
      type,
      from,
      payload,
      timestamp: Date.now(),
    };
    this.channel.postMessage(message);
  }

  close() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }
}


