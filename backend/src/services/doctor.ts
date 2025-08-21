import { PrismaClient, DoctorStatus, DayOfWeek } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
export const createDoctorProfileSchema = z.object({
  licenseNumber: z.string().min(5, 'License number must be at least 5 characters'),
  yearsOfExperience: z.number().min(0).max(50),
  bio: z.string().optional(),
  consultationFee: z.number().min(0),
  clinicName: z.string().optional(),
  clinicAddress: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  specialtyIds: z.array(z.string()).min(1, 'At least one specialty is required'),
});

export const updateDoctorProfileSchema = createDoctorProfileSchema.partial();

export const doctorAvailabilitySchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  isActive: z.boolean().default(true),
});

export const searchDoctorsSchema = z.object({
  specialtyId: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  minFee: z.number().optional(),
  maxFee: z.number().optional(),
  isVerified: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
});

export type CreateDoctorProfileData = z.infer<typeof createDoctorProfileSchema>;
export type UpdateDoctorProfileData = z.infer<typeof updateDoctorProfileSchema>;
export type DoctorAvailabilityData = z.infer<typeof doctorAvailabilitySchema>;
export type SearchDoctorsData = z.infer<typeof searchDoctorsSchema>;

export class DoctorService {
  // Create doctor profile
  static async createDoctorProfile(userId: string, data: CreateDoctorProfileData) {
    const { specialtyIds, ...profileData } = data;

    // Check if doctor profile already exists
    const existingProfile = await prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new Error('Doctor profile already exists');
    }

    // Check if license number is already taken
    const existingLicense = await prisma.doctorProfile.findUnique({
      where: { licenseNumber: data.licenseNumber },
    });

    if (existingLicense) {
      throw new Error('License number already registered');
    }

    // Create doctor profile with specialties
    const doctorProfile = await prisma.doctorProfile.create({
      data: {
        ...profileData,
        userId,
        specialties: {
          create: specialtyIds.map(specialtyId => ({
            specialtyId,
          })),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImage: true,
          },
        },
        specialties: {
          include: {
            specialty: true,
          },
        },
        availability: true,
      },
    });

    return doctorProfile;
  }

  // Get doctor profile by user ID
  static async getDoctorProfile(userId: string) {
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImage: true,
          },
        },
        specialties: {
          include: {
            specialty: true,
          },
        },
        availability: {
          orderBy: {
            dayOfWeek: 'asc',
          },
        },
      },
    });

    if (!doctorProfile) {
      throw new Error('Doctor profile not found');
    }

    return doctorProfile;
  }

  // Update doctor profile
  static async updateDoctorProfile(userId: string, data: UpdateDoctorProfileData) {
    const { specialtyIds, ...profileData } = data;

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctorProfile) {
      throw new Error('Doctor profile not found');
    }

    // Update profile data
    const updateData: any = { ...profileData };

    // Handle specialty updates if provided
    if (specialtyIds) {
      updateData.specialties = {
        deleteMany: {},
        create: specialtyIds.map(specialtyId => ({
          specialtyId,
        })),
      };
    }

    const updatedProfile = await prisma.doctorProfile.update({
      where: { userId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImage: true,
          },
        },
        specialties: {
          include: {
            specialty: true,
          },
        },
        availability: true,
      },
    });

    return updatedProfile;
  }

  // Set doctor availability
  static async setAvailability(userId: string, availabilityData: DoctorAvailabilityData[]) {
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctorProfile) {
      throw new Error('Doctor profile not found');
    }

    // Validate time ranges
    for (const slot of availabilityData) {
      const startTime = new Date(`2000-01-01T${slot.startTime}:00`);
      const endTime = new Date(`2000-01-01T${slot.endTime}:00`);
      
      if (startTime >= endTime) {
        throw new Error(`Invalid time range for ${slot.dayOfWeek}: start time must be before end time`);
      }
    }

    // Delete existing availability and create new ones
    await prisma.doctorAvailability.deleteMany({
      where: { doctorId: doctorProfile.id },
    });

    const availability = await prisma.doctorAvailability.createMany({
      data: availabilityData.map(slot => ({
        doctorId: doctorProfile.id,
        ...slot,
      })),
    });

    return availability;
  }

  // Get doctor availability
  static async getAvailability(userId: string) {
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctorProfile) {
      throw new Error('Doctor profile not found');
    }

    const availability = await prisma.doctorAvailability.findMany({
      where: { doctorId: doctorProfile.id },
      orderBy: {
        dayOfWeek: 'asc',
      },
    });

    return availability;
  }

  // Search doctors
  static async searchDoctors(searchParams: SearchDoctorsData) {
    const {
      specialtyId,
      city,
      state,
      minFee,
      maxFee,
      isVerified,
      page,
      limit,
    } = searchParams;

    const skip = (page - 1) * limit;

    const where: any = {
      status: DoctorStatus.VERIFIED,
    };

    // Add filters
    if (specialtyId) {
      where.specialties = {
        some: {
          specialtyId,
        },
      };
    }

    if (city) {
      where.city = {
        contains: city,
        mode: 'insensitive',
      };
    }

    if (state) {
      where.state = {
        contains: state,
        mode: 'insensitive',
      };
    }

    if (minFee !== undefined || maxFee !== undefined) {
      where.consultationFee = {};
      if (minFee !== undefined) where.consultationFee.gte = minFee;
      if (maxFee !== undefined) where.consultationFee.lte = maxFee;
    }

    if (isVerified !== undefined) {
      where.isVerified = isVerified;
    }

    const [doctors, total] = await Promise.all([
      prisma.doctorProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
          specialties: {
            include: {
              specialty: true,
            },
          },
          availability: {
            where: {
              isActive: true,
            },
          },
        },
        orderBy: [
          { isVerified: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.doctorProfile.count({ where }),
    ]);

    return {
      doctors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get all specialties
  static async getSpecialties() {
    const specialties = await prisma.specialty.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return specialties;
  }

  // Create specialty (admin only)
  static async createSpecialty(name: string, description?: string) {
    const specialty = await prisma.specialty.create({
      data: {
        name,
        description,
      },
    });

    return specialty;
  }

  // Generate available time slots for a doctor on a specific date
  static async getAvailableSlots(doctorId: string, date: Date) {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase() as DayOfWeek;
    
    const availability = await prisma.doctorAvailability.findUnique({
      where: {
        doctorId_dayOfWeek: {
          doctorId,
          dayOfWeek,
        },
      },
    });

    if (!availability || !availability.isActive) {
      return [];
    }

    // Generate 30-minute slots
    const slots = [];
    const startTime = new Date(`2000-01-01T${availability.startTime}:00`);
    const endTime = new Date(`2000-01-01T${availability.endTime}:00`);
    
    let currentTime = new Date(startTime);
    
    while (currentTime < endTime) {
      const slotTime = currentTime.toTimeString().slice(0, 5);
      slots.push({
        time: slotTime,
        available: true, // TODO: Check against existing appointments
      });
      
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    return slots;
  }
}