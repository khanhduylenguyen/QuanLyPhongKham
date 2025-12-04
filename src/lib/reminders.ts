/**
 * Appointment Reminder Service
 * Tự động gửi nhắc nhở Email/SMS 24h và 2h trước lịch hẹn
 */

import { sendAppointmentReminderEmail } from "./email";
import { sendAppointmentReminderSMS } from "./sms";

// Appointment interface compatible with existing appointments
export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  notes?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
  reminders?: {
    sent24h?: boolean;
    sent24hAt?: string;
    sent2h?: boolean;
    sent2hAt?: string;
  };
}

// Type guard to check if appointment has required fields
function isValidAppointment(apt: any): apt is Appointment {
  return (
    apt &&
    typeof apt.id === "string" &&
    typeof apt.patientName === "string" &&
    typeof apt.patientPhone === "string" &&
    typeof apt.doctorId === "string" &&
    typeof apt.doctorName === "string" &&
    typeof apt.specialty === "string" &&
    typeof apt.date === "string" &&
    typeof apt.time === "string" &&
    typeof apt.status === "string" &&
    ["pending", "confirmed", "cancelled", "completed"].includes(apt.status)
  );
}

const APPOINTMENTS_STORAGE_KEY = "cliniccare:appointments";

// Load appointments from localStorage
function loadAppointments(): Appointment[] {
  try {
    const stored = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Filter and validate appointments
      if (Array.isArray(parsed)) {
        return parsed.filter(isValidAppointment);
      }
    }
  } catch (error) {
    console.error("[Reminder Service] Error loading appointments:", error);
  }
  return [];
}

// Save appointments to localStorage
function saveAppointments(appointments: Appointment[]): void {
  try {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
    // Trigger storage event for cross-tab sync
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("appointmentsUpdated"));
  } catch (error) {
    console.error("[Reminder Service] Error saving appointments:", error);
  }
}

// Calculate time until appointment in hours
function getHoursUntilAppointment(date: string, time: string): number {
  const appointmentDateTime = new Date(`${date}T${time}:00`);
  const now = new Date();
  const diffMs = appointmentDateTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours;
}

// Check if appointment is eligible for reminder
function isEligibleForReminder(appointment: Appointment): boolean {
  // Only send reminders for confirmed appointments
  if (appointment.status !== "confirmed") {
    return false;
  }

  // Don't send reminders for past appointments
  const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}:00`);
  const now = new Date();
  if (appointmentDateTime < now) {
    return false;
  }

  return true;
}

// Send 24h reminder
async function send24hReminder(appointment: Appointment): Promise<boolean> {
  const hoursUntil = getHoursUntilAppointment(appointment.date, appointment.time);
  
  // Send reminder if between 23-25 hours before (1 hour window)
  if (hoursUntil >= 23 && hoursUntil <= 25) {
    // Check if already sent
    if (appointment.reminders?.sent24h) {
      return false;
    }

    console.log(`[Reminder Service] Sending 24h reminder for appointment ${appointment.id}`);

    let emailSent = false;
    let smsSent = false;

    // Send email if available
    if (appointment.patientEmail) {
      try {
        const emailResult = await sendAppointmentReminderEmail(
          appointment.patientEmail,
          appointment,
          "24h"
        );
        emailSent = emailResult.success;
        if (!emailResult.success) {
          console.warn(`[Reminder Service] Failed to send 24h email: ${emailResult.error}`);
        }
      } catch (error) {
        console.error("[Reminder Service] Error sending 24h email:", error);
      }
    }

    // Send SMS if phone available
    if (appointment.patientPhone) {
      try {
        const smsResult = await sendAppointmentReminderSMS(
          appointment.patientPhone,
          appointment,
          "24h"
        );
        smsSent = smsResult.success;
        if (!smsResult.success) {
          console.warn(`[Reminder Service] Failed to send 24h SMS: ${smsResult.error}`);
        }
      } catch (error) {
        console.error("[Reminder Service] Error sending 24h SMS:", error);
      }
    }

    // Mark as sent if at least one channel succeeded
    if (emailSent || smsSent) {
      const appointments = loadAppointments();
      const index = appointments.findIndex((apt) => apt.id === appointment.id);
      if (index !== -1) {
        appointments[index] = {
          ...appointments[index],
          reminders: {
            ...appointments[index].reminders,
            sent24h: true,
            sent24hAt: new Date().toISOString(),
          },
        };
        saveAppointments(appointments);
        console.log(`[Reminder Service] ✅ 24h reminder sent for appointment ${appointment.id}`);
        return true;
      }
    }

    return false;
  }

  return false;
}

// Send 2h reminder
async function send2hReminder(appointment: Appointment): Promise<boolean> {
  const hoursUntil = getHoursUntilAppointment(appointment.date, appointment.time);
  
  // Send reminder if between 1.5-2.5 hours before (1 hour window)
  if (hoursUntil >= 1.5 && hoursUntil <= 2.5) {
    // Check if already sent
    if (appointment.reminders?.sent2h) {
      return false;
    }

    console.log(`[Reminder Service] Sending 2h reminder for appointment ${appointment.id}`);

    let emailSent = false;
    let smsSent = false;

    // Send email if available
    if (appointment.patientEmail) {
      try {
        const emailResult = await sendAppointmentReminderEmail(
          appointment.patientEmail,
          appointment,
          "2h"
        );
        emailSent = emailResult.success;
        if (!emailResult.success) {
          console.warn(`[Reminder Service] Failed to send 2h email: ${emailResult.error}`);
        }
      } catch (error) {
        console.error("[Reminder Service] Error sending 2h email:", error);
      }
    }

    // Send SMS if phone available
    if (appointment.patientPhone) {
      try {
        const smsResult = await sendAppointmentReminderSMS(
          appointment.patientPhone,
          appointment,
          "2h"
        );
        smsSent = smsResult.success;
        if (!smsResult.success) {
          console.warn(`[Reminder Service] Failed to send 2h SMS: ${smsResult.error}`);
        }
      } catch (error) {
        console.error("[Reminder Service] Error sending 2h SMS:", error);
      }
    }

    // Mark as sent if at least one channel succeeded
    if (emailSent || smsSent) {
      const appointments = loadAppointments();
      const index = appointments.findIndex((apt) => apt.id === appointment.id);
      if (index !== -1) {
        appointments[index] = {
          ...appointments[index],
          reminders: {
            ...appointments[index].reminders,
            sent2h: true,
            sent2hAt: new Date().toISOString(),
          },
        };
        saveAppointments(appointments);
        console.log(`[Reminder Service] ✅ 2h reminder sent for appointment ${appointment.id}`);
        return true;
      }
    }

    return false;
  }

  return false;
}

// Check and send reminders for all eligible appointments
export async function checkAndSendReminders(): Promise<{
  sent24h: number;
  sent2h: number;
  errors: number;
}> {
  const appointments = loadAppointments();
  const eligibleAppointments = appointments.filter(isEligibleForReminder);

  let sent24h = 0;
  let sent2h = 0;
  let errors = 0;

  for (const appointment of eligibleAppointments) {
    try {
      const sent24 = await send24hReminder(appointment);
      if (sent24) sent24h++;

      const sent2 = await send2hReminder(appointment);
      if (sent2) sent2h++;
    } catch (error) {
      console.error(`[Reminder Service] Error processing appointment ${appointment.id}:`, error);
      errors++;
    }
  }

  if (sent24h > 0 || sent2h > 0) {
    console.log(
      `[Reminder Service] Reminder check completed: ${sent24h} 24h reminders, ${sent2h} 2h reminders sent`
    );
  }

  return { sent24h, sent2h, errors };
}

// Start automatic reminder checking
let reminderInterval: number | null = null;

export function startReminderService(intervalMinutes: number = 30): void {
  // Stop existing interval if any
  if (reminderInterval !== null) {
    stopReminderService();
  }

  console.log(`[Reminder Service] Starting automatic reminder checks every ${intervalMinutes} minutes`);

  // Check immediately on start
  checkAndSendReminders();

  // Then check at intervals
  reminderInterval = window.setInterval(() => {
    checkAndSendReminders();
  }, intervalMinutes * 60 * 1000);
}

// Stop automatic reminder checking
export function stopReminderService(): void {
  if (reminderInterval !== null) {
    clearInterval(reminderInterval);
    reminderInterval = null;
    console.log("[Reminder Service] Stopped automatic reminder checks");
  }
}

// Manual trigger (useful for testing)
export function triggerReminderCheck(): Promise<{
  sent24h: number;
  sent2h: number;
  errors: number;
}> {
  return checkAndSendReminders();
}

