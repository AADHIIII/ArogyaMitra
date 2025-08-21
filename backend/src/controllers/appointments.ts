import { Request, Response } from 'express';
import { AppointmentService } from '../services/appointment';
import { AuthRequest } from '../middleware/auth';

export class AppointmentController {
  // Book a new appointment (patients only)
  static async bookAppointment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Only patients can book appointments
      if (req.user?.role !== 'PATIENT') {
        return res.status(403).json({ error: 'Only patients can book appointments' });
      }

      const appointment = await AppointmentService.bookAppointment(userId, req.body);

      res.status(201).json({
        message: 'Appointment booked successfully',
        data: appointment,
      });
    } catch (error: any) {
      console.error('Book appointment error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get available slots for a doctor on a specific date
  static async getAvailableSlots(req: Request, res: Response) {
    try {
      const { doctorProfileId } = req.params;
      const { date } = req.query;

      if (!date || typeof date !== 'string') {
        return res.status(400).json({ error: 'Date is required' });
      }

      const requestedDate = new Date(date);
      if (isNaN(requestedDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }

      const slots = await AppointmentService.getAvailableSlots(doctorProfileId, date);

      res.json({
        message: 'Available slots retrieved successfully',
        data: {
          date,
          doctorProfileId,
          slots,
        },
      });
    } catch (error: any) {
      console.error('Get available slots error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get appointments for current user
  static async getMyAppointments(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const filters = {
        status: req.query.status as any,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
      };

      const result = await AppointmentService.getAppointments(userId, userRole, filters);

      res.json({
        message: 'Appointments retrieved successfully',
        data: result.appointments,
        pagination: result.pagination,
      });
    } catch (error: any) {
      console.error('Get appointments error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get specific appointment by ID
  static async getAppointment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const { appointmentId } = req.params;

      if (!userId || !userRole) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const appointment = await AppointmentService.getAppointmentById(
        appointmentId,
        userId,
        userRole
      );

      res.json({
        message: 'Appointment retrieved successfully',
        data: appointment,
      });
    } catch (error: any) {
      console.error('Get appointment error:', error);
      if (error.message === 'Appointment not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Access denied') {
        res.status(403).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  // Update appointment (for doctors to add notes, change status, etc.)
  static async updateAppointment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const { appointmentId } = req.params;

      if (!userId || !userRole) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const appointment = await AppointmentService.updateAppointment(
        appointmentId,
        userId,
        userRole,
        req.body
      );

      res.json({
        message: 'Appointment updated successfully',
        data: appointment,
      });
    } catch (error: any) {
      console.error('Update appointment error:', error);
      if (error.message === 'Appointment not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('Access denied') || error.message.includes('Only')) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  // Cancel appointment
  static async cancelAppointment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const { appointmentId } = req.params;
      const { cancelReason } = req.body;

      if (!userId || !userRole) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const appointment = await AppointmentService.updateAppointment(
        appointmentId,
        userId,
        userRole,
        {
          status: 'CANCELLED' as any,
          cancelReason,
        }
      );

      res.json({
        message: 'Appointment cancelled successfully',
        data: appointment,
      });
    } catch (error: any) {
      console.error('Cancel appointment error:', error);
      if (error.message === 'Appointment not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('Access denied') || error.message.includes('Only')) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  // Reschedule appointment
  static async rescheduleAppointment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const { appointmentId } = req.params;

      if (!userId || !userRole) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const appointment = await AppointmentService.rescheduleAppointment(
        appointmentId,
        userId,
        userRole,
        req.body
      );

      res.json({
        message: 'Appointment rescheduled successfully',
        data: appointment,
      });
    } catch (error: any) {
      console.error('Reschedule appointment error:', error);
      if (error.message === 'Appointment not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('Access denied') || error.message.includes('only')) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  // Confirm appointment (doctors only)
  static async confirmAppointment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const { appointmentId } = req.params;

      if (!userId || !userRole) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (userRole !== 'DOCTOR') {
        return res.status(403).json({ error: 'Only doctors can confirm appointments' });
      }

      const appointment = await AppointmentService.updateAppointment(
        appointmentId,
        userId,
        userRole,
        {
          status: 'CONFIRMED' as any,
        }
      );

      res.json({
        message: 'Appointment confirmed successfully',
        data: appointment,
      });
    } catch (error: any) {
      console.error('Confirm appointment error:', error);
      if (error.message === 'Appointment not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('Access denied') || error.message.includes('Only')) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  // Complete appointment (doctors only)
  static async completeAppointment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const { appointmentId } = req.params;

      if (!userId || !userRole) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (userRole !== 'DOCTOR') {
        return res.status(403).json({ error: 'Only doctors can complete appointments' });
      }

      const { notes, prescription } = req.body;

      const appointment = await AppointmentService.updateAppointment(
        appointmentId,
        userId,
        userRole,
        {
          status: 'COMPLETED' as any,
          notes,
          prescription,
        }
      );

      res.json({
        message: 'Appointment completed successfully',
        data: appointment,
      });
    } catch (error: any) {
      console.error('Complete appointment error:', error);
      if (error.message === 'Appointment not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('Access denied') || error.message.includes('Only')) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  // Get appointment statistics
  static async getAppointmentStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const stats = await AppointmentService.getAppointmentStats(userId, userRole);

      res.json({
        message: 'Appointment statistics retrieved successfully',
        data: stats,
      });
    } catch (error: any) {
      console.error('Get appointment stats error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get today's appointments (for doctors)
  static async getTodayAppointments(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (userRole !== 'DOCTOR') {
        return res.status(403).json({ error: 'Only doctors can access this endpoint' });
      }

      const today = new Date().toISOString().split('T')[0];

      const filters = {
        startDate: today,
        endDate: today,
        page: 1,
        limit: 50,
      };

      const result = await AppointmentService.getAppointments(userId, userRole, filters);

      res.json({
        message: "Today's appointments retrieved successfully",
        data: result.appointments,
      });
    } catch (error: any) {
      console.error("Get today's appointments error:", error);
      res.status(400).json({ error: error.message });
    }
  }
}