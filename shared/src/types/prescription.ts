import { z } from 'zod';

export enum MedicationFrequency {
  ONCE_DAILY = 'ONCE_DAILY',
  TWICE_DAILY = 'TWICE_DAILY',
  THREE_TIMES_DAILY = 'THREE_TIMES_DAILY',
  FOUR_TIMES_DAILY = 'FOUR_TIMES_DAILY',
  AS_NEEDED = 'AS_NEEDED',
  WEEKLY = 'WEEKLY',
  CUSTOM = 'CUSTOM'
}

export enum MedicationUnit {
  MG = 'MG',
  ML = 'ML',
  TABLET = 'TABLET',
  CAPSULE = 'CAPSULE',
  DROP = 'DROP',
  SPRAY = 'SPRAY',
  PATCH = 'PATCH'
}

export const PrescriptionSchema = z.object({
  id: z.string().uuid(),
  appointmentId: z.string().uuid(),
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  medicationName: z.string().min(1),
  dosage: z.number().positive(),
  unit: z.nativeEnum(MedicationUnit),
  frequency: z.nativeEnum(MedicationFrequency),
  customFrequency: z.string().optional(), // For CUSTOM frequency
  duration: z.number().int().positive(), // days
  instructions: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  refillsAllowed: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const MedicationIntakeSchema = z.object({
  id: z.string().uuid(),
  prescriptionId: z.string().uuid(),
  patientId: z.string().uuid(),
  scheduledAt: z.date(),
  takenAt: z.date().optional(),
  confirmed: z.boolean().default(false),
  skipped: z.boolean().default(false),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const MedicationReminderSchema = z.object({
  id: z.string().uuid(),
  prescriptionId: z.string().uuid(),
  patientId: z.string().uuid(),
  reminderTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Type exports
export type Prescription = z.infer<typeof PrescriptionSchema>;
export type MedicationIntake = z.infer<typeof MedicationIntakeSchema>;
export type MedicationReminder = z.infer<typeof MedicationReminderSchema>;

// API Request schemas
export const CreatePrescriptionSchema = PrescriptionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdatePrescriptionSchema = CreatePrescriptionSchema.partial();

export const ConfirmMedicationIntakeSchema = z.object({
  prescriptionId: z.string().uuid(),
  takenAt: z.date().optional().default(() => new Date()),
  notes: z.string().optional(),
});

export const SkipMedicationIntakeSchema = z.object({
  prescriptionId: z.string().uuid(),
  reason: z.string().optional(),
});

export type CreatePrescriptionRequest = z.infer<typeof CreatePrescriptionSchema>;
export type UpdatePrescriptionRequest = z.infer<typeof UpdatePrescriptionSchema>;
export type ConfirmMedicationIntakeRequest = z.infer<typeof ConfirmMedicationIntakeSchema>;
export type SkipMedicationIntakeRequest = z.infer<typeof SkipMedicationIntakeSchema>;