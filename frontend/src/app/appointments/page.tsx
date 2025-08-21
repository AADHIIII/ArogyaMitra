'use client';

import { useState } from 'react';
import { 
  CalendarIcon, 
  ClockIcon,
  MapPinIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock data - replace with actual API calls
const mockAppointments = [
  {
    id: '1',
    doctorName: 'Dr. Sarah Wilson',
    specialty: 'Cardiologist',
    date: '2025-08-12',
    time: '10:00 AM',
    duration: '30 min',
    status: 'CONFIRMED',
    type: 'IN_PERSON',
    location: 'Wilson Medical Center, Mumbai',
    symptoms: 'Regular checkup and chest pain consultation',
    appointmentFee: 1200
  },
  {
    id: '2',
    doctorName: 'Dr. Rajesh Kumar',
    specialty: 'General Medicine',
    date: '2025-08-15',
    time: '2:30 PM',
    duration: '15 min',
    status: 'PENDING',
    type: 'VIDEO_CALL',
    location: 'Video Consultation',
    symptoms: 'Follow-up for medication review',
    appointmentFee: 800
  },
  {
    id: '3',
    doctorName: 'Dr. Priya Sharma',
    specialty: 'Dermatologist',
    date: '2025-08-10',
    time: '11:00 AM',
    duration: '45 min',
    status: 'COMPLETED',
    type: 'IN_PERSON',
    location: 'Sharma Skin Clinic, Bangalore',
    symptoms: 'Skin rash and acne treatment',
    appointmentFee: 1000
  },
  {
    id: '4',
    doctorName: 'Dr. Michael Brown',
    specialty: 'Orthopedics',
    date: '2025-08-08',
    time: '9:00 AM',
    duration: '30 min',
    status: 'CANCELLED',
    type: 'IN_PERSON',
    location: 'Brown Orthopedic Center, Delhi',
    symptoms: 'Knee pain and mobility issues',
    appointmentFee: 1500
  }
];

const statusConfig = {
  CONFIRMED: {
    color: 'text-success-600 bg-success-50 border-success-200',
    icon: CheckCircleIcon,
    label: 'Confirmed'
  },
  PENDING: {
    color: 'text-warning-600 bg-warning-50 border-warning-200',
    icon: ExclamationTriangleIcon,
    label: 'Pending'
  },
  COMPLETED: {
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    icon: CheckCircleIcon,
    label: 'Completed'
  },
  CANCELLED: {
    color: 'text-error-600 bg-error-50 border-error-200',
    icon: XCircleIcon,
    label: 'Cancelled'
  }
};

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);

  const filterAppointments = (status: string) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (status) {
      case 'upcoming':
        return mockAppointments.filter(apt => 
          (apt.status === 'CONFIRMED' || apt.status === 'PENDING') && 
          apt.date >= today
        );
      case 'past':
        return mockAppointments.filter(apt => 
          apt.status === 'COMPLETED' || 
          (apt.status === 'CANCELLED' && apt.date < today) ||
          (apt.date < today && apt.status !== 'PENDING')
        );
      case 'all':
        return mockAppointments;
      default:
        return mockAppointments;
    }
  };

  const filteredAppointments = filterAppointments(activeTab);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-600 mt-1">Manage your healthcare appointments</p>
          </div>
          <Link href="/doctors">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Book New Appointment
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'upcoming', label: 'Upcoming', count: filterAppointments('upcoming').length },
              { key: 'past', label: 'Past', count: filterAppointments('past').length },
              { key: 'all', label: 'All', count: mockAppointments.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const statusInfo = statusConfig[appointment.status as keyof typeof statusConfig];
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={appointment.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.doctorName}
                        </h3>
                        <p className="text-sm text-gray-600">{appointment.specialty}</p>
                      </div>
                      <div className={`flex items-center px-3 py-1 rounded-full border ${statusInfo.color}`}>
                        <StatusIcon className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">{statusInfo.label}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span className="font-medium">{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        <span>{appointment.time} • {appointment.duration}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        {appointment.type === 'VIDEO_CALL' ? (
                          <VideoCameraIcon className="h-4 w-4 mr-2" />
                        ) : (
                          <MapPinIcon className="h-4 w-4 mr-2" />
                        )}
                        <span>{appointment.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium text-primary-600">₹{appointment.appointmentFee}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Reason:</span> {appointment.symptoms}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {appointment.status === 'CONFIRMED' && (
                        <>
                          {appointment.type === 'VIDEO_CALL' && (
                            <Button size="sm">
                              <VideoCameraIcon className="h-4 w-4 mr-1" />
                              Join Video Call
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            Reschedule
                          </Button>
                          <Button variant="ghost" size="sm">
                            Cancel
                          </Button>
                        </>
                      )}
                      
                      {appointment.status === 'PENDING' && (
                        <>
                          <Button variant="outline" size="sm">
                            Reschedule
                          </Button>
                          <Button variant="ghost" size="sm">
                            Cancel
                          </Button>
                        </>
                      )}

                      {appointment.status === 'COMPLETED' && (
                        <>
                          <Button variant="outline" size="sm">
                            View Prescription
                          </Button>
                          <Button variant="outline" size="sm">
                            Download Report
                          </Button>
                          <Button variant="ghost" size="sm">
                            Book Follow-up
                          </Button>
                        </>
                      )}

                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredAppointments.length === 0 && (
          <Card className="p-12 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab} appointments
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'upcoming' 
                ? "You don't have any upcoming appointments. Book one with your preferred doctor."
                : `No ${activeTab} appointments found.`
              }
            </p>
            {activeTab === 'upcoming' && (
              <Link href="/doctors">
                <Button>Book Your First Appointment</Button>
              </Link>
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}