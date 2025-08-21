import { z } from 'zod';

export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN',
  CARE_COORDINATOR = 'CARE_COORDINATOR'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION'
}

// Base User Schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  phone: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.nativeEnum(UserRole),
  status: z.nativeEnum(UserStatus),
  profileImage: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Patient-specific Schema
export const PatientProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  dateOfBirth: z.date(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  emergencyContact: z.string(),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
  currentMedications: z.string().optional(),
  preferredLanguage: z.string().default('en'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Doctor-specific Schema
export const DoctorProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  licenseNumber: z.string(),
  specialty: z.string(),
  subSpecialty: z.string().optional(),
  yearsOfExperience: z.number().int().min(0),
  education: z.string(),
  hospitalAffiliation: z.string().optional(),
  consultationFee: z.number().positive(),
  bio: z.string().optional(),
  languages: z.array(z.string()),
  rating: z.number().min(0).max(5).default(0),
  totalReviews: z.number().int().min(0).default(0),
  isVerified: z.boolean().default(false),
  acceptsInsurance: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type PatientProfile = z.infer<typeof PatientProfileSchema>;
export type DoctorProfile = z.infer<typeof DoctorProfileSchema>;

// API Request/Response schemas
export const CreateUserSchema = UserSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const UpdateUserSchema = CreateUserSchema.partial();

export type CreateUserRequest = z.infer<typeof CreateUserSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;