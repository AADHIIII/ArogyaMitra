import { Request, Response } from 'express';
import { DoctorService } from '../services/doctor';
import { AuthRequest } from '../middleware/auth';

export class DoctorController {
  // Create doctor profile
  static async createProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate user role
      if (req.user?.role !== 'DOCTOR') {
        return res.status(403).json({ error: 'Only doctors can create doctor profiles' });
      }

      const doctorProfile = await DoctorService.createDoctorProfile(userId, req.body);

      res.status(201).json({
        message: 'Doctor profile created successfully',
        data: doctorProfile,
      });
    } catch (error: any) {
      console.error('Create doctor profile error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get current doctor's profile
  static async getMyProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const doctorProfile = await DoctorService.getDoctorProfile(userId);

      res.json({
        message: 'Doctor profile retrieved successfully',
        data: doctorProfile,
      });
    } catch (error: any) {
      console.error('Get doctor profile error:', error);
      res.status(404).json({ error: error.message });
    }
  }

  // Get doctor profile by ID (public)
  static async getProfile(req: Request, res: Response) {
    try {
      const { doctorId } = req.params;

      // Find doctor profile by doctor profile ID
      const doctorProfile = await DoctorService.getDoctorProfile(doctorId);

      // Only return public information
      const publicProfile = {
        id: doctorProfile.id,
        user: {
          firstName: doctorProfile.user.firstName,
          lastName: doctorProfile.user.lastName,
          profileImage: doctorProfile.user.profileImage,
        },
        yearsOfExperience: doctorProfile.yearsOfExperience,
        bio: doctorProfile.bio,
        consultationFee: doctorProfile.consultationFee,
        clinicName: doctorProfile.clinicName,
        clinicAddress: doctorProfile.clinicAddress,
        city: doctorProfile.city,
        state: doctorProfile.state,
        isVerified: doctorProfile.isVerified,
        specialties: doctorProfile.specialties,
        availability: doctorProfile.availability,
      };

      res.json({
        message: 'Doctor profile retrieved successfully',
        data: publicProfile,
      });
    } catch (error: any) {
      console.error('Get doctor profile error:', error);
      res.status(404).json({ error: error.message });
    }
  }

  // Update doctor profile
  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate user role
      if (req.user?.role !== 'DOCTOR') {
        return res.status(403).json({ error: 'Only doctors can update doctor profiles' });
      }

      const doctorProfile = await DoctorService.updateDoctorProfile(userId, req.body);

      res.json({
        message: 'Doctor profile updated successfully',
        data: doctorProfile,
      });
    } catch (error: any) {
      console.error('Update doctor profile error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Set doctor availability
  static async setAvailability(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate user role
      if (req.user?.role !== 'DOCTOR') {
        return res.status(403).json({ error: 'Only doctors can set availability' });
      }

      const { availability } = req.body;
      if (!Array.isArray(availability)) {
        return res.status(400).json({ error: 'Availability must be an array' });
      }

      await DoctorService.setAvailability(userId, availability);

      res.json({
        message: 'Availability set successfully',
      });
    } catch (error: any) {
      console.error('Set availability error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get doctor availability
  static async getAvailability(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const availability = await DoctorService.getAvailability(userId);

      res.json({
        message: 'Availability retrieved successfully',
        data: availability,
      });
    } catch (error: any) {
      console.error('Get availability error:', error);
      res.status(404).json({ error: error.message });
    }
  }

  // Get available slots for a doctor on a specific date
  static async getAvailableSlots(req: Request, res: Response) {
    try {
      const { doctorId } = req.params;
      const { date } = req.query;

      if (!date || typeof date !== 'string') {
        return res.status(400).json({ error: 'Date is required' });
      }

      const requestedDate = new Date(date);
      if (isNaN(requestedDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }

      const slots = await DoctorService.getAvailableSlots(doctorId, requestedDate);

      res.json({
        message: 'Available slots retrieved successfully',
        data: {
          date: date,
          slots,
        },
      });
    } catch (error: any) {
      console.error('Get available slots error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Search doctors
  static async searchDoctors(req: Request, res: Response) {
    try {
      const searchParams = {
        specialtyId: req.query.specialtyId as string,
        city: req.query.city as string,
        state: req.query.state as string,
        minFee: req.query.minFee ? Number(req.query.minFee) : undefined,
        maxFee: req.query.maxFee ? Number(req.query.maxFee) : undefined,
        isVerified: req.query.isVerified ? req.query.isVerified === 'true' : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
      };

      const result = await DoctorService.searchDoctors(searchParams);

      res.json({
        message: 'Doctors retrieved successfully',
        data: result.doctors,
        pagination: result.pagination,
      });
    } catch (error: any) {
      console.error('Search doctors error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get all specialties
  static async getSpecialties(req: Request, res: Response) {
    try {
      const specialties = await DoctorService.getSpecialties();

      res.json({
        message: 'Specialties retrieved successfully',
        data: specialties,
      });
    } catch (error: any) {
      console.error('Get specialties error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create specialty (admin only)
  static async createSpecialty(req: AuthRequest, res: Response) {
    try {
      // Validate admin role
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Only admins can create specialties' });
      }

      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Specialty name is required' });
      }

      const specialty = await DoctorService.createSpecialty(name, description);

      res.status(201).json({
        message: 'Specialty created successfully',
        data: specialty,
      });
    } catch (error: any) {
      console.error('Create specialty error:', error);
      res.status(400).json({ error: error.message });
    }
  }
}