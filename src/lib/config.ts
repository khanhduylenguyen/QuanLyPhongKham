export const CLINIC_NAME: string =
  (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_CLINIC_NAME) ||
  'ClinicCare';


