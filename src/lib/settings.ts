export type ThemeMode = "light" | "dark" | "system";

export type SystemSettings = {
  clinic: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logoUrl?: string;
  };
  notifications: {
    appointmentEmail: boolean;
    appointmentSMS: boolean;
    lowStockAlerts: boolean;
    systemAnnouncements: boolean;
  };
  security: {
    sessionTimeoutMinutes: number;
    mfaRequiredForAdmins: boolean;
    passwordMinLength: number;
  };
  thresholds: {
    capacityDoctorsWarning: number;
    medsLowStock: number;
  };
  ui: {
    theme: ThemeMode;
    primaryColor: string;
  };
  integrations: {
    mapsApiKey?: string;
    ehrEndpoint?: string;
    bookingEndpoint?: string;
  };
};

export const DEFAULT_SETTINGS: SystemSettings = {
  clinic: { name: "ClinicCare", address: "123 Nguyễn Trãi, Q1", phone: "028 1234 5678", email: "contact@cliniccare.vn", logoUrl: "" },
  notifications: { appointmentEmail: true, appointmentSMS: false, lowStockAlerts: true, systemAnnouncements: true },
  security: { sessionTimeoutMinutes: 30, mfaRequiredForAdmins: false, passwordMinLength: 8 },
  thresholds: { capacityDoctorsWarning: 10, medsLowStock: 50 },
  ui: { theme: "system", primaryColor: "#007BFF" },
  integrations: { mapsApiKey: "", ehrEndpoint: "/api", bookingEndpoint: "/api" },
};

export const SETTINGS_STORAGE_KEY = "cliniccare:settings";

export function getSettings(): SystemSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as SystemSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(next: SystemSettings): void {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
}


