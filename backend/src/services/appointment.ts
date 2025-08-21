import { PrismaClient, AppointmentStatus, PaymentStatus, DayOfWeek } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
export const bookAppointmentSchema = z.object({
  doctorProfileId: z.string().uuid('Invalid doctor profile ID'),
  appointmentDate: z.string().refine((date) => {
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointmentDate >= today;
  }, 'Appointment date must be today or in the future'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  symptoms: z.string().optional(),
});

export const updateAppointmentSchema = z.object({
  status: z.nativeEnum(AppointmentStatus).optional(),
  notes: z.string().optional(),
  prescription: z.string().optional(),
  cancelReason: z.string().optional(),
});

export const rescheduleAppointmentSchema = z.object({
  newAppointmentDate: z.string().refine((date) => {
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointmentDate >= today;
  }, 'New appointment date must be today or in the future'),
  newStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  rescheduleReason: z.string().min(1, 'Reschedule reason is required'),
});

export const getAppointmentsSchema = z.object({
  status: z.nativeEnum(AppointmentStatus).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
});

export type BookAppointmentData = z.infer<typeof bookAppointmentSchema>;
export type UpdateAppointmentData = z.infer<typeof updateAppointmentSchema>;
export type RescheduleAppointmentData = z.infer<typeof rescheduleAppointmentSchema>;
export type GetAppointmentsData = z.infer<typeof getAppointmentsSchema>;

export class AppointmentService {
  // Book a new appointment
  static async bookAppointment(patientId: string, data: BookAppointmentData) {
    const { doctorProfileId, appointmentDate, startTime, symptoms } = data;

    // Get doctor profile with user info
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { id: doctorProfileId },
      include: { user: true },
    });

    if (!doctorProfile) {
      throw new Error('Doctor not found');
    }

    if (!doctorProfile.isVerified) {
      throw new Error('Doctor is not verified');
    }

    // Check if the slot is available
    const isSlotAvailable = await this.isSlotAvailable(
      doctorProfileId,
      appointmentDate,
      startTime
    );

    if (!isSlotAvailable) {
      throw new Error('Selected time slot is not available');
    }

    // Calculate end time (30 minutes later)
    const startDateTime = new Date(`2000-01-01T${startTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);
    const endTime = endDateTime.toTimeString().slice(0, 5);

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId: doctorProfile.userId,
        doctorProfileId,
        appointmentDate: new Date(appointmentDate),
        startTime,
        endTime,
        consultationFee: doctorProfile.consultationFee,
        symptoms,
        status: AppointmentStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      },
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
        doctorProfile: {
          select: {
            clinicName: true,
            clinicAddress: true,
            city: true,
            state: true,
          },
        },
      },
    });

    return appointment;
  }

  // Check if a time slot is available
  static async isSlotAvailable(
    doctorProfileId: string,
    appointmentDate: string,
    startTime: string
  ): Promise<boolean> {
    const date = new Date(appointmentDate);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase() as DayOfWeek;

    // Check if doctor is available on this day
    const availability = await prisma.doctorAvailability.findUnique({
      where: {
        doctorId_dayOfWeek: {
          doctorId: doctorProfileId,
          dayOfWeek,
        },
      },
    });

    if (!availability || !availability.isActive) {
      return false;
    }

    // Check if the requested time is within doctor's working hours
    const requestedTime = new Date(`2000-01-01T${startTime}:00`);
    const availableStartTime = new Date(`2000-01-01T${availability.startTime}:00`);
    const availableEndTime = new Date(`2000-01-01T${availability.endTime}:00`);

    if (requestedTime < availableStartTime || requestedTime >= availableEndTime) {
      return false;
    }

    // Check if there's already an appointment at this time
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorProfileId,
        appointmentDate: date,
        startTime,
        status: {
          not: AppointmentStatus.CANCELLED,
        },
      },
    });

    return !existingAppointment;
  }

  // Get available slots for a doctor on a specific date
  static async getAvailableSlots(doctorProfileId: string, appointmentDate: string) {
    const date = new Date(appointmentDate);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase() as DayOfWeek;

    // Get doctor's availability for this day
    const availability = await prisma.doctorAvailability.findUnique({
      where: {
        doctorId_dayOfWeek: {
          doctorId: doctorProfileId,
          dayOfWeek,
        },
      },
    });

    if (!availability || !availability.isActive) {
      return [];
    }

    // Get existing appointments for this date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorProfileId,
        appointmentDate: date,
        status: {
          not: AppointmentStatus.CANCELLED,
        },
      },
      select: {
        startTime: true,
      },
    });

    const bookedSlots = new Set(existingAppointments.map(apt => apt.startTime));

    // Generate 30-minute slots
    const slots = [];
    const startTime = new Date(`2000-01-01T${availability.startTime}:00`);
    const endTime = new Date(`2000-01-01T${availability.endTime}:00`);

    let currentTime = new Date(startTime);

    while (currentTime < endTime) {
      const slotTime = currentTime.toTimeString().slice(0, 5);
      const isAvailable = !bookedSlots.has(slotTime);

      slots.push({
        time: slotTime,
        available: isAvailable,
      });

      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    return slots;
  }

  // Get appointments for a user (patient or doctor)
  static async getAppointments(
    userId: string,
    userRole: string,
    filters: GetAppointmentsData
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
      where.appointmentDate = {};
      if (startDate) where.appointmentDate.gte = new Date(startDate);
      if (endDate) where.appointmentDate.lte = new Date(endDate);
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
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
          doctorProfile: {
            select: {
              clinicName: true,
              clinicAddress: true,
              city: true,
              state: true,
              specialties: {
                include: {
                  specialty: true,
                },
              },
            },
          },
        },
        orderBy: [
          { appointmentDate: 'asc' },
          { startTime: 'asc' },
        ],
      }),
      prisma.appointment.count({ where }),
    ]);

    return {
      appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get appointment by ID
  static async getAppointmentById(appointmentId: string, userId: string, userRole: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
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
        doctorProfile: {
          select: {
            clinicName: true,
            clinicAddress: true,
            city: true,
            state: true,
            specialties: {
              include: {
                specialty: true,
              },
            },
          },
        },
      },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Check if user has access to this appointment
    const hasAccess = 
      (userRole === 'PATIENT' && appointment.patientId === userId) ||
      (userRole === 'DOCTOR' && appointment.doctorId === userId) ||
      userRole === 'ADMIN';

    if (!hasAccess) {
      throw new Error('Access denied');
    }

    return appointment;
  }

  // Update appointment (for doctors to add notes, prescriptions, etc.)
  static async updateAppointment(
    appointmentId: string,
    userId: string,
    userRole: string,
    data: UpdateAppointmentData
  ) {
    const appointment = await this.getAppointmentById(appointmentId, userId, userRole);

    // Only doctors can update notes and prescriptions
    if (userRole === 'DOCTOR' && appointment.doctorId !== userId) {
      throw new Error('Only the assigned doctor can update this appointment');
    }

    // Only patients can cancel their own appointments
    if (data.status === AppointmentStatus.CANCELLED && userRole === 'PATIENT' && appointment.patientId !== userId) {
      throw new Error('Only the patient can cancel this appointment');
    }

    const updateData: any = { ...data };

    // Set timestamps based on status changes
    if (data.status === AppointmentStatus.CONFIRMED) {
      updateData.confirmedAt = new Date();
    } else if (data.status === AppointmentStatus.COMPLETED) {
      updateData.completedAt = new Date();
    } else if (data.status === AppointmentStatus.CANCELLED) {
      updateData.cancelledAt = new Date();
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
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
        doctorProfile: {
          select: {
            clinicName: true,
            clinicAddress: true,
            city: true,
            state: true,
          },
        },
      },
    });

    return updatedAppointment;
  }

  // Reschedule appointment
  static async rescheduleAppointment(
    appointmentId: string,
    userId: string,
    userRole: string,
    data: RescheduleAppointmentData
  ) {
    const originalAppointment = await this.getAppointmentById(appointmentId, userId, userRole);

    // Check if user can reschedule this appointment
    const canReschedule = 
      (userRole === 'PATIENT' && originalAppointment.patientId === userId) ||
      (userRole === 'DOCTOR' && originalAppointment.doctorId === userId);

    if (!canReschedule) {
      throw new Error('You can only reschedule your own appointments');
    }

    // Check if new slot is available
    const isSlotAvailable = await this.isSlotAvailable(
      originalAppointment.doctorProfileId,
      data.newAppointmentDate,
      data.newStartTime
    );

    if (!isSlotAvailable) {
      throw new Error('Selected new time slot is not available');
    }

    // Calculate new end time
    const startDateTime = new Date(`2000-01-01T${data.newStartTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);
    const newEndTime = endDateTime.toTimeString().slice(0, 5);

    // Update original appointment status
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.RESCHEDULED,
        cancelledAt: new Date(),
        cancelReason: `Rescheduled: ${data.rescheduleReason}`,
      },
    });

    // Create new appointment
    const newAppointment = await prisma.appointment.create({
      data: {
        patientId: originalAppointment.patientId,
        doctorId: originalAppointment.doctorId,
        doctorProfileId: originalAppointment.doctorProfileId,
        appointmentDate: new Date(data.newAppointmentDate),
        startTime: data.newStartTime,
        endTime: newEndTime,
        consultationFee: originalAppointment.consultationFee,
        symptoms: originalAppointment.symptoms,
        status: AppointmentStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        originalAppointmentId: appointmentId,
        rescheduleReason: data.rescheduleReason,
      },
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
        doctorProfile: {
          select: {
            clinicName: true,
            clinicAddress: true,
            city: true,
            state: true,
          },
        },
      },
    });

    return newAppointment;
  }

  // Get appointment statistics (for dashboard)
  static async getAppointmentStats(userId: string, userRole: string) {
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
      pending,
      confirmed,
      completed,
      cancelled,
      upcoming,
    ] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.count({ where: { ...where, status: AppointmentStatus.PENDING } }),
      prisma.appointment.count({ where: { ...where, status: AppointmentStatus.CONFIRMED } }),
      prisma.appointment.count({ where: { ...where, status: AppointmentStatus.COMPLETED } }),
      prisma.appointment.count({ where: { ...where, status: AppointmentStatus.CANCELLED } }),
      prisma.appointment.count({
        where: {
          ...where,
          appointmentDate: { gte: new Date() },
          status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
        },
      }),
    ]);

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      upcoming,
    };
  }
}