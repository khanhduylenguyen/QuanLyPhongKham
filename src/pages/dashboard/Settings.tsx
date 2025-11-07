import { useEffect, useRef, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download, Upload, RotateCcw, Save, Shield, Bell, Palette, Building2, Link as LinkIcon, Database, Settings as SettingsIcon } from "lucide-react";
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY, SystemSettings, ThemeMode, saveSettings } from "@/lib/settings";

const Settings = () => {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const save = () => {
    saveSettings(settings);
    toast.success("Đã lưu cấu hình hệ thống");
  };

  const resetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    toast.success("Đã khôi phục mặc định");
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `settings_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as SystemSettings;
      setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      saveSettings({ ...DEFAULT_SETTINGS, ...parsed });
      toast.success("Đã nhập cấu hình từ file");
    } catch {
      toast.error("File không hợp lệ");
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cài đặt hệ thống</h1>
            <p className="text-[#687280] mt-1">Quản trị cấu hình chung, giao diện, bảo mật và tích hợp</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-[#E5E7EB]" onClick={exportJSON}><Download className="h-4 w-4 mr-2" />Xuất JSON</Button>
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importJSON(f); e.currentTarget.value = ""; }} />
            <Button variant="outline" className="border-[#E5E7EB]" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4 mr-2" />Nhập JSON</Button>
            <Button variant="outline" className="border-[#E5E7EB]" onClick={resetDefaults}><RotateCcw className="h-4 w-4 mr-2" />Khôi phục</Button>
            <Button className="bg-[#007BFF] hover:bg-[#0056B3]" onClick={save}><Save className="h-4 w-4 mr-2" />Lưu</Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">Chung</TabsTrigger>
            <TabsTrigger value="notifications">Thông báo</TabsTrigger>
            <TabsTrigger value="security">Bảo mật</TabsTrigger>
            <TabsTrigger value="ui">Giao diện</TabsTrigger>
            <TabsTrigger value="integrations">Tích hợp</TabsTrigger>
          </TabsList>

          {/* General */}
          <TabsContent value="general" className="space-y-6">
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />Thông tin phòng khám</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clinicName">Tên phòng khám</Label>
                    <Input id="clinicName" value={settings.clinic.name} onChange={(e) => setSettings((s) => ({ ...s, clinic: { ...s.clinic, name: e.target.value } }))} className="border-[#E5E7EB]" />
                  </div>
                  <div>
                    <Label htmlFor="clinicPhone">Điện thoại</Label>
                    <Input id="clinicPhone" value={settings.clinic.phone} onChange={(e) => setSettings((s) => ({ ...s, clinic: { ...s.clinic, phone: e.target.value } }))} className="border-[#E5E7EB]" />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="clinicAddress">Địa chỉ</Label>
                    <Input id="clinicAddress" value={settings.clinic.address} onChange={(e) => setSettings((s) => ({ ...s, clinic: { ...s.clinic, address: e.target.value } }))} className="border-[#E5E7EB]" />
                  </div>
                  <div>
                    <Label htmlFor="clinicEmail">Email</Label>
                    <Input id="clinicEmail" type="email" value={settings.clinic.email} onChange={(e) => setSettings((s) => ({ ...s, clinic: { ...s.clinic, email: e.target.value } }))} className="border-[#E5E7EB]" />
                  </div>
                  <div>
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input id="logoUrl" value={settings.clinic.logoUrl || ""} onChange={(e) => setSettings((s) => ({ ...s, clinic: { ...s.clinic, logoUrl: e.target.value } }))} className="border-[#E5E7EB]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><SettingsIcon className="h-5 w-5" />Ngưỡng & tham số</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Ngưỡng cảnh báo bác sĩ/cơ sở</Label>
                  <Input type="number" min={1} value={settings.thresholds.capacityDoctorsWarning}
                    onChange={(e) => setSettings((s) => ({ ...s, thresholds: { ...s.thresholds, capacityDoctorsWarning: Number(e.target.value) } }))}
                    className="border-[#E5E7EB]" />
                </div>
                <div>
                  <Label>Tồn kho thấp (thuốc)</Label>
                  <Input type="number" min={0} value={settings.thresholds.medsLowStock}
                    onChange={(e) => setSettings((s) => ({ ...s, thresholds: { ...s.thresholds, medsLowStock: Number(e.target.value) } }))}
                    className="border-[#E5E7EB]" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Thông báo</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between border rounded-md p-3 border-[#E5E7EB]">
                  <div>
                    <div className="font-medium">Email lịch hẹn</div>
                    <div className="text-sm text-[#687280]">Gửi email xác nhận và nhắc lịch</div>
                  </div>
                  <Switch checked={settings.notifications.appointmentEmail} onCheckedChange={(v) => setSettings((s) => ({ ...s, notifications: { ...s.notifications, appointmentEmail: !!v } }))} />
                </div>
                <div className="flex items-center justify-between border rounded-md p-3 border-[#E5E7EB]">
                  <div>
                    <div className="font-medium">SMS lịch hẹn</div>
                    <div className="text-sm text-[#687280]">Gửi tin nhắn SMS nhắc lịch</div>
                  </div>
                  <Switch checked={settings.notifications.appointmentSMS} onCheckedChange={(v) => setSettings((s) => ({ ...s, notifications: { ...s.notifications, appointmentSMS: !!v } }))} />
                </div>
                <div className="flex items-center justify-between border rounded-md p-3 border-[#E5E7EB]">
                  <div>
                    <div className="font-medium">Cảnh báo tồn kho</div>
                    <div className="text-sm text-[#687280]">Thông báo khi thuốc xuống thấp</div>
                  </div>
                  <Switch checked={settings.notifications.lowStockAlerts} onCheckedChange={(v) => setSettings((s) => ({ ...s, notifications: { ...s.notifications, lowStockAlerts: !!v } }))} />
                </div>
                <div className="flex items-center justify-between border rounded-md p-3 border-[#E5E7EB]">
                  <div>
                    <div className="font-medium">Thông báo hệ thống</div>
                    <div className="text-sm text-[#687280]">Tin tức & bảo trì hệ thống</div>
                  </div>
                  <Switch checked={settings.notifications.systemAnnouncements} onCheckedChange={(v) => setSettings((s) => ({ ...s, notifications: { ...s.notifications, systemAnnouncements: !!v } }))} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Bảo mật</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Thời gian phiên (phút)</Label>
                  <Input type="number" min={5} value={settings.security.sessionTimeoutMinutes} onChange={(e) => setSettings((s) => ({ ...s, security: { ...s.security, sessionTimeoutMinutes: Number(e.target.value) } }))} className="border-[#E5E7EB]" />
                </div>
                <div>
                  <Label>Độ dài mật khẩu tối thiểu</Label>
                  <Input type="number" min={6} value={settings.security.passwordMinLength} onChange={(e) => setSettings((s) => ({ ...s, security: { ...s.security, passwordMinLength: Number(e.target.value) } }))} className="border-[#E5E7EB]" />
                </div>
                <div className="flex items-center justify-between border rounded-md p-3 border-[#E5E7EB]">
                  <div>
                    <div className="font-medium">Yêu cầu MFA cho Admin</div>
                    <div className="text-sm text-[#687280]">Bật xác thực 2 lớp cho tài khoản quản trị</div>
                  </div>
                  <Switch checked={settings.security.mfaRequiredForAdmins} onCheckedChange={(v) => setSettings((s) => ({ ...s, security: { ...s.security, mfaRequiredForAdmins: !!v } }))} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* UI */}
          <TabsContent value="ui" className="space-y-6">
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" />Giao diện</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Theme</Label>
                  <Select value={settings.ui.theme} onValueChange={(v) => setSettings((s) => ({ ...s, ui: { ...s.ui, theme: v as ThemeMode } }))}>
                    <SelectTrigger className="border-[#E5E7EB]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">Hệ thống</SelectItem>
                      <SelectItem value="light">Sáng</SelectItem>
                      <SelectItem value="dark">Tối</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Màu chủ đạo</Label>
                  <Input type="color" value={settings.ui.primaryColor} onChange={(e) => setSettings((s) => ({ ...s, ui: { ...s.ui, primaryColor: e.target.value } }))} className="border-[#E5E7EB] h-10 p-1" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations" className="space-y-6">
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><LinkIcon className="h-5 w-5" />Tích hợp</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Google Maps API Key</Label>
                  <Input value={settings.integrations.mapsApiKey || ""} onChange={(e) => setSettings((s) => ({ ...s, integrations: { ...s.integrations, mapsApiKey: e.target.value } }))} className="border-[#E5E7EB]" />
                </div>
                <div>
                  <Label>EHR API Endpoint</Label>
                  <Input value={settings.integrations.ehrEndpoint || ""} onChange={(e) => setSettings((s) => ({ ...s, integrations: { ...s.integrations, ehrEndpoint: e.target.value } }))} className="border-[#E5E7EB]" />
                </div>
                <div>
                  <Label>Booking API Endpoint</Label>
                  <Input value={settings.integrations.bookingEndpoint || ""} onChange={(e) => setSettings((s) => ({ ...s, integrations: { ...s.integrations, bookingEndpoint: e.target.value } }))} className="border-[#E5E7EB]" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" />Sao lưu & khôi phục</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-[#687280]">Sao lưu cấu hình hiện tại hoặc nhập file JSON đã xuất trước đó.</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="border-[#E5E7EB]" onClick={exportJSON}><Download className="h-4 w-4 mr-2" />Xuất cấu hình</Button>
                  <Button variant="outline" className="border-[#E5E7EB]" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4 mr-2" />Nhập cấu hình</Button>
                  <Button variant="outline" className="border-[#E5E7EB]" onClick={resetDefaults}><RotateCcw className="h-4 w-4 mr-2" />Khôi phục mặc định</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;


