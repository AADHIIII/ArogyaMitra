import { PrismaClient, PrescriptionStatus, MedicationFrequency, IntakeStatus } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
export const createPrescriptionSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  appointmentId: z.string().uuid('Invalid appointment ID').optional(),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  validUntil: z.string().optional(),
  medications: z.array(z.object({
    name: z.string().min(1, 'Medication name is required'),
    genericName: z.string().optional(),
    dosage: z.string().min(1, 'Dosage is required'),
    frequency: z.nativeEnum(MedicationFrequency),
    duration: z.number().min(1, 'Duration must be at least 1 day'),
    instructions: z.string().optional(),
    reminderTimes: z.array(z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format')),
  })).min(1, 'At least one medication is required'),
});

export const updatePrescriptionSchema = z.object({
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(PrescriptionStatus).optional(),
  validUntil: z.string().optional(),
});

export const recordIntakeSchema = z.object({
  medicationId: z.string().uuid('Invalid medication ID'),
  scheduledTime: z.string(),
  actualTime: z.string().optional(),
  status: z.nativeEnum(IntakeStatus),
  notes: z.string().optional(),
});

export const getPrescriptionsSchema = z.object({
  status: z.nativeEnum(PrescriptionStatus).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
});

export type CreatePrescriptionData = z.infer<typeof createPrescriptionSchema>;
export type UpdatePrescriptionData = z.infer<typeof updatePrescriptionSchema>;
export type RecordIntakeData = z.infer<typeof recordIntakeSchema>;
export type GetPrescriptionsData = z.infer<typeof getPrescriptionsSchema>;

export class PrescriptionService {
  // Create a new prescription
  static async createPrescription(doctorId: string, data: CreatePrescriptionData) {
    const { medications, validUntil, ...prescriptionData } = data;

    // Validate that doctor can prescribe to this patient
    if (data.appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: data.appointmentId },
      });

      if (!appointment || appointment.doctorId !== doctorId) {
        throw new Error('Invalid appointment or unauthorized access');
      }
    }

    // Create prescription with medications
    const prescription = await prisma.prescription.create({
      data: {
        ...prescriptionData,
        doctorId,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        medications: {
          create: medications.map(med => {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + med.duration);

            return {
              name: med.name,
              genericName: med.genericName,
              dosage: med.dosage,
              frequency: med.frequency,
              duration: med.duration,
              instructions: med.instructions,
              startDate,
              endDate,
              reminderTimes: med.reminderTimes,
            };
          }),
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
            startTime: true,
          },
        },
        medications: true,
      },
    });

    // Generate initial medication intake schedule
    await this.generateIntakeSchedule(prescription.medications);

    return prescription;
  }

  // Generate medication intake schedule
  static async generateIntakeSchedule(medications: any[]) {
    const intakeRecords = [];

    for (const medication of medications) {
      const startDate = new Date(medication.startDate);
      const endDate = new Date(medication.endDate);
      const reminderTimes = medication.reminderTimes;

      // Generate daily intake records
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        for (const time of reminderTimes) {
          const scheduledDateTime = new Date(date);
          const [hours, minutes] = time.split(':').map(Number);
          scheduledDateTime.setHours(hours, minutes, 0, 0);

          intakeRecords.push({
            medicationId: medication.id,
            scheduledTime: scheduledDateTime,
            status: IntakeStatus.TAKEN, // Default status, will be updated by patient
          });
        }
      }
    }

    // Batch create intake records
    if (intakeRecords.length > 0) {
      await prisma.medicationIntake.createMany({
        data: intakeRecords,
      });
    }
  }

  // Get prescriptions for a user
  static async getPrescriptions(
    userId: string,
    userRole: string,
    filters: GetPrescriptionsData
  ) {
    const { status, startDate, endDate, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Set user filter based on role
    if (userRole === 'PATIENT') {
      where.patientId = userId;
    } else if (userRole === 'DOCTOR') {
      where.doctorId = userId;
    } else {
      throw new Error('Invalid user role');
    }

    // Add optional filters
    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.issuedDate = {};
      if (startDate) where.issuedDate.gte = new Date(startDate);
      if (endDate) where.issuedDate.lte = new Date(endDate);
    }

    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          appointment: {
            select: {
              id: true,
              appointmentDate: true,
              startTime: true,
            },
          },
          medications: {
            include: {
              intakeRecords: {
                where: {
                  scheduledTime: {
                    gte: new Date(),
                  },
                },
                take: 5,
                orderBy: {
                  scheduledTime: 'asc',
                },
              },
            },
          },
        },
        orderBy: {
          issuedDate: 'desc',
        },
      }),
      prisma.prescription.count({ where }),
    ]);

    return {
      prescriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get prescription by ID
  static async getPrescriptionById(prescriptionId: string, userId: string, userRole: string) {
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
            startTime: true,
            symptoms: true,
          },
        },
        medications: {
          include: {
            intakeRecords: {
              orderBy: {
                scheduledTime: 'desc',
              },
              take: 10,
            },
          },
        },
      },
    });

    if (!prescription) {
      throw new Error('Prescription not found');
    }

    // Check access permissions
    const hasAccess = 
      (userRole === 'PATIENT' && prescription.patientId === userId) ||
      (userRole === 'DOCTOR' && prescription.doctorId === userId) ||
      userRole === 'ADMIN';

    if (!hasAccess) {
      throw new Error('Access denied');
    }

    return prescription;
  }

  // Update prescription
  static async updatePrescription(
    prescriptionId: string,
    userId: string,
    userRole: string,
    data: UpdatePrescriptionData
  ) {
    const prescription = await this.getPrescriptionById(prescriptionId, userId, userRole);

    // Only doctors can update prescriptions
    if (userRole !== 'DOCTOR' || prescription.doctorId !== userId) {
      throw new Error('Only the prescribing doctor can update this prescription');
    }

    const updateData: any = { ...data };

    if (data.validUntil) {
      updateData.validUntil = new Date(data.validUntil);
    }

    const updatedPrescription = await prisma.prescription.update({
      where: { id: prescriptionId },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        medications: true,
      },
    });

    return updatedPrescription;
  }

  // Record medication intake
  static async recordMedicationIntake(userId: string, data: RecordIntakeData) {
    const { medicationId, scheduledTime, actualTime, status, notes } = data;

    // Verify that the medication belongs to the user
    const medication = await prisma.medication.findUnique({
      where: { id: medicationId },
      include: {
        prescription: true,
      },
    });

    if (!medication || medication.prescription.patientId !== userId) {
      throw new Error('Medication not found or access denied');
    }

    // Find or create intake record
    const scheduledDateTime = new Date(scheduledTime);
    const actualDateTime = actualTime ? new Date(actualTime) : new Date();

    const intakeRecord = await prisma.medicationIntake.upsert({
      where: {
        medicationId_scheduledTime: {
          medicationId,
          scheduledTime: scheduledDateTime,
        },
      },
      update: {
        actualTime: actualDateTime,
        status,
        notes,
      },
      create: {
        medicationId,
        scheduledTime: scheduledDateTime,
        actualTime: actualDateTime,
        status,
        notes,
      },
    });

    return intakeRecord;
  }

  // Get medication schedule for a patient
  static async getMedicationSchedule(userId: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const intakeRecords = await prisma.medicationIntake.findMany({
      where: {
        medication: {
          prescription: {
            patientId: userId,
            status: PrescriptionStatus.ACTIVE,
          },
        },
        scheduledTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        medication: {
          include: {
            prescription: {
              include: {
                doctor: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        scheduledTime: 'asc',
      },
    });

    return intakeRecords;
  }

  // Get medication adherence statistics
  static async getMedicationAdherence(userId: string, medicationId?: string) {
    const where: any = {
      medication: {
        prescription: {
          patientId: userId,
        },
      },
    };

    if (medicationId) {
      where.medicationId = medicationId;
    }

    const [total, taken, missed, skipped] = await Promise.all([
      prisma.medicationIntake.count({ where }),
      prisma.medicationIntake.count({ where: { ...where, status: IntakeStatus.TAKEN } }),
      prisma.medicationIntake.count({ where: { ...where, status: IntakeStatus.MISSED } }),
      prisma.medicationIntake.count({ where: { ...where, status: IntakeStatus.SKIPPED } }),
    ]);

    const adherenceRate = total > 0 ? (taken / total) * 100 : 0;

    return {
      total,
      taken,
      missed,
      skipped,
      adherenceRate: Math.round(adherenceRate * 100) / 100,
    };
  }

  // Get upcoming medication reminders
  static async getUpcomingReminders(userId: string, hours: number = 24) {
    const now = new Date();
    const futureTime = new Date();
    futureTime.setHours(futureTime.getHours() + hours);

    const upcomingIntakes = await prisma.medicationIntake.findMany({
      where: {
        medication: {
          prescription: {
            patientId: userId,
            status: PrescriptionStatus.ACTIVE,
          },
        },
        scheduledTime: {
          gte: now,
          lte: futureTime,
        },
        status: {
          in: [IntakeStatus.TAKEN], // Only pending intakes
        },
      },
      include: {
        medication: {
          select: {
            name: true,
            dosage: true,
            instructions: true,
          },
        },
      },
      orderBy: {
        scheduledTime: 'asc',
      },
    });

    return upcomingIntakes;
  }

  // Get prescription statistics (for dashboard)
  static async getPrescriptionStats(userId: string, userRole: string) {
    const where: any = {};

    if (userRole === 'PATIENT') {
      where.patientId = userId;
    } else if (userRole === 'DOCTOR') {
      where.doctorId = userId;
    } else if (userRole !== 'ADMIN') {
      throw new Error('Invalid user role');
    }

    const [
      total,
      active,
      completed,
      expired,
      totalMedications,
    ] = await Promise.all([
      prisma.prescription.count({ where }),
      prisma.prescription.count({ where: { ...where, status: PrescriptionStatus.ACTIVE } }),
      prisma.prescription.count({ where: { ...where, status: PrescriptionStatus.COMPLETED } }),
      prisma.prescription.count({ where: { ...where, status: PrescriptionStatus.EXPIRED } }),
      prisma.medication.count({
        where: {
          prescription: where,
        },
      }),
    ]);

    return {
      total,
      active,
      completed,
      expired,
      totalMedications,
    };
  }
}