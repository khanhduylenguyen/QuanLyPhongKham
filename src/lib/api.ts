export type UploadResponse = { url: string; name: string; type: string };
export type EHRRecord = {
  patientId: string;
  visitDate: string; // ISO
  doctor: string;
  diagnosis: string;
  conclusion?: string;
  vitals?: { bpSys?: number; bpDia?: number; hr?: number; weight?: number; height?: number; bmi?: number };
  labs?: Array<{ name: string; result: number | string; unit?: string; ref?: string; status?: string }>;
  images?: string[];
};

const API_BASE = "/api"; // change if needed

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  // try json
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

export async function uploadAttachment(patientId: string, file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  try {
    const res = await fetch(`${API_BASE}/patients/${patientId}/attachments`, { method: "POST", body: form });
    if (!res.ok) throw new Error("Upload failed");
    const data = (await res.json()) as UploadResponse;
    return data;
  } catch {
    // Fallback local object URL for demo
    return { url: URL.createObjectURL(file), name: file.name, type: file.type };
  }
}

export async function createEHR(record: EHRRecord): Promise<{ id: string } & EHRRecord> {
  try {
    return await apiFetch<{ id: string } & EHRRecord>(`/patients/${record.patientId}/ehr`, {
      method: "POST",
      body: JSON.stringify(record),
    });
  } catch (e) {
    // Fallback to localStorage demo
    const key = `cliniccare:ehr:${record.patientId}`;
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    const withId = { id: crypto.randomUUID(), ...record };
    list.push(withId);
    localStorage.setItem(key, JSON.stringify(list));
    return withId;
  }
}

export async function listEHR(patientId: string): Promise<Array<{ id: string } & EHRRecord>> {
  try {
    return await apiFetch<Array<{ id: string } & EHRRecord>>(`/patients/${patientId}/ehr`, { method: "GET" });
  } catch {
    const key = `cliniccare:ehr:${patientId}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
  }
}
