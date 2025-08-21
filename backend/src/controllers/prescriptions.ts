import { Request, Response } from 'express';
import { PrescriptionService } from '../services/prescription';
import { AuthRequest } from '../middleware/auth';

export class PrescriptionController {
  // Create a new prescription (doctors only)
  static async createPrescription(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Only doctors can create prescriptions
      if (req.user?.role !== 'DOCTOR') {
        return res.status(403).json({ error: 'Only doctors can create prescriptions' });
      }

      const prescription = await PrescriptionService.createPrescription(userId, req.body);

      res.status(201).json({
        message: 'Prescription created successfully',
        data: prescription,
      });
    } catch (error: any) {
      console.error('Create prescription error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get prescriptions for current user
  static async getMyPrescriptions(req: AuthRequest, res: Response) {
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

      const result = await PrescriptionService.getPrescriptions(userId, userRole, filters);

      res.json({
        message: 'Prescriptions retrieved successfully',
        data: result.prescriptions,
        pagination: result.pagination,
      });
    } catch (error: any) {
      console.error('Get prescriptions error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get specific prescription by ID
  static async getPrescription(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const { prescriptionId } = req.params;

      if (!userId || !userRole) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const prescription = await PrescriptionService.getPrescriptionById(
        prescriptionId,
        userId,
        userRole
      );

      res.json({
        message: 'Prescription retrieved successfully',
        data: prescription,
      });
    } catch (error: any) {
      console.error('Get prescription error:', error);
      if (error.message === 'Prescription not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Access denied') {
        res.status(403).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  // Update prescription (doctors only)
  static async updatePrescription(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const { prescriptionId } = req.params;

      if (!userId || !userRole) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const prescription = await PrescriptionService.updatePrescription(
        prescriptionId,
        userId,
        userRole,
        req.body
      );

      res.json({
        message: 'Prescription updated successfully',
        data: prescription,
      });
    } catch (error: any) {
      console.error('Update prescription error:', error);
      if (error.message === 'Prescription not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('Only the prescribing doctor')) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  // Record medication intake (patients only)
  static async recordMedicationIntake(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Only patients can record medication intake
      if (req.user?.role !== 'PATIENT') {
        return res.status(403).json({ error: 'Only patients can record medication intake' });
      }

      const intakeRecord = await PrescriptionService.recordMedicationIntake(userId, req.body);

      res.json({
        message: 'Medication intake recorded successfully',
        data: intakeRecord,
      });
    } catch (error: any) {
      console.error('Record medication intake error:', error);
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  // Get medication schedule for a specific date (patients only)
  static async getMedicationSchedule(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Only patients can view their medication schedule
      if (req.user?.role !== 'PATIENT') {
        return res.status(403).json({ error: 'Only patients can view medication schedule' });
      }

      const { date } = req.query;
      const schedule = await PrescriptionService.getMedicationSchedule(
        userId,
        date as string
      );

      res.json({
        message: 'Medication schedule retrieved successfully',
        data: {
          date: date || new Date().toISOString().split('T')[0],
          schedule,
        },
      });
    } catch (error: any) {
      console.error('Get medication schedule error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get medication adherence statistics (patients only)
  static async getMedicationAdherence(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Only patients can view their adherence
      if (req.user?.role !== 'PATIENT') {
        return res.status(403).json({ error: 'Only patients can view medication adherence' });
      }

      const { medicationId } = req.query;
      const adherence = await PrescriptionService.getMedicationAdherence(
        userId,
        medicationId as string
      );

      res.json({
        message: 'Medication adherence retrieved successfully',
        data: adherence,
      });
    } catch (error: any) {
      console.error('Get medication adherence error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get upcoming medication reminders (patients only)
  static async getUpcomingReminders(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Only patients can view their reminders
      if (req.user?.role !== 'PATIENT') {
        return res.status(403).json({ error: 'Only patients can view medication reminders' });
      }

      const { hours } = req.query;
      const reminders = await PrescriptionService.getUpcomingReminders(
        userId,
        hours ? Number(hours) : 24
      );

      res.json({
        message: 'Upcoming reminders retrieved successfully',
        data: reminders,
      });
    } catch (error: any) {
      console.error('Get upcoming reminders error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get prescription statistics
  static async getPrescriptionStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const stats = await PrescriptionService.getPrescriptionStats(userId, userRole);

      res.json({
        message: 'Prescription statistics retrieved successfully',
        data: stats,
      });
    } catch (error: any) {
      console.error('Get prescription stats error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Mark prescription as completed (doctors only)
  static async completePrescription(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const { prescriptionId } = req.params;

      if (!userId || !userRole) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (userRole !== 'DOCTOR') {
        return res.status(403).json({ error: 'Only doctors can complete prescriptions' });
      }

      const prescription = await PrescriptionService.updatePrescription(
        prescriptionId,
        userId,
        userRole,
        { status: 'COMPLETED' as any }
      );

      res.json({
        message: 'Prescription marked as completed',
        data: prescription,
      });
    } catch (error: any) {
      console.error('Complete prescription error:', error);
      if (error.message === 'Prescription not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('Only the prescribing doctor')) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  // Cancel prescription (doctors only)
  static async cancelPrescription(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const { prescriptionId } = req.params;

      if (!userId || !userRole) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (userRole !== 'DOCTOR') {
        return res.status(403).json({ error: 'Only doctors can cancel prescriptions' });
      }

      const { reason } = req.body;

      const prescription = await PrescriptionService.updatePrescription(
        prescriptionId,
        userId,
        userRole,
        { 
          status: 'CANCELLED' as any,
          notes: reason ? `Cancelled: ${reason}` : 'Prescription cancelled by doctor'
        }
      );

      res.json({
        message: 'Prescription cancelled successfully',
        data: prescription,
      });
    } catch (error: any) {
      console.error('Cancel prescription error:', error);
      if (error.message === 'Prescription not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('Only the prescribing doctor')) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }
}