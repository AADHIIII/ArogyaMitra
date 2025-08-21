'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CalendarIcon, 
  HeartIcon, 
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

// Mock data - replace with actual API calls
const mockAppointments = [
  {
    id: '1',
    doctorName: 'Dr. Sarah Wilson',
    specialty: 'Cardiologist',
    date: '2025-08-12',
    time: '10:00 AM',
    status: 'CONFIRMED',
    type: 'In-person'
  },
  {
    id: '2',
    doctorName: 'Dr. Rajesh Kumar',
    specialty: 'General Medicine',
    date: '2025-08-15',
    time: '2:30 PM',
    status: 'PENDING',
    type: 'Video call'
  }
];

const mockMedications = [
  {
    id: '1',
    name: 'Aspirin 75mg',
    dosage: '1 tablet daily',
    nextDose: '2:00 PM',
    adherence: 85
  },
  {
    id: '2',
    name: 'Lisinopril 10mg',
    dosage: '1 tablet daily',
    nextDose: '8:00 AM',
    adherence: 92
  }
];

const mockActivity = [
  {
    id: '1',
    type: 'prescription',
    message: 'Prescription updated by Dr. Wilson',
    time: '2 hours ago'
  },
  {
    id: '2',
    type: 'appointment',
    message: 'Appointment confirmed for tomorrow',
    time: '4 hours ago'
  },
  {
    id: '3',
    type: 'message',
    message: 'New message from Dr. Kumar',
    time: '1 day ago'
  }
];

export default function PatientDashboard() {
  const { user } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'text-success-600 bg-success-50';
      case 'PENDING':
        return 'text-warning-600 bg-warning-50';
      case 'CANCELLED':
        return 'text-error-600 bg-error-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const nextAppointment = mockAppointments.find(apt => apt.status === 'CONFIRMED');

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            {getGreeting()}, {user?.firstName}! 👋
          </h1>
          {nextAppointment ? (
            <p className="text-primary-100">
              Your next appointment is with {nextAppointment.doctorName} on{' '}
              {new Date(nextAppointment.date).toLocaleDateString()} at {nextAppointment.time}
            </p>
          ) : (
            <p className="text-primary-100">
              You have no upcoming appointments. Book one with your preferred doctor.
            </p>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{mockAppointments.length}</p>
                <p className="text-sm text-gray-600">Upcoming Appointments</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/appointments">
                <Button variant="outline" size="sm" className="w-full">
                  View All
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HeartIcon className="h-8 w-8 text-error-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{mockMedications.length}</p>
                <p className="text-sm text-gray-600">Active Medications</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/medications">
                <Button variant="outline" size="sm" className="w-full">
                  View All
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-sm text-gray-600">Health Reports</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/records">
                <Button variant="outline" size="sm" className="w-full">
                  View All
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
              <Link href="/doctors">
                <Button size="sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Book New
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {mockAppointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{appointment.doctorName}</h3>
                      <p className="text-sm text-gray-600">{appointment.specialty}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(appointment.date).toLocaleDateString()}
                        <ClockIcon className="h-4 w-4 ml-3 mr-1" />
                        {appointment.time}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{appointment.type}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Button variant="outline" size="sm">
                      Reschedule
                    </Button>
                    <Button variant="ghost" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}

              {mockAppointments.length === 0 && (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No upcoming appointments</p>
                  <Link href="/doctors">
                    <Button className="mt-4">Book Your First Appointment</Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>

          {/* Today's Medications */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Today's Medications</h2>
              <Link href="/medications">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {mockMedications.map((medication) => (
                <div key={medication.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 flex items-center">
                        💊 {medication.name}
                      </h3>
                      <p className="text-sm text-gray-600">{medication.dosage}</p>
                      <p className="text-sm text-primary-600 font-medium mt-1">
                        Next dose: {medication.nextDose}
                      </p>
                      <div className="flex items-center mt-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-success-500 h-2 rounded-full" 
                            style={{ width: `${medication.adherence}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs text-gray-600">
                          {medication.adherence}% adherence
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Button size="sm">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Mark as Taken
                    </Button>
                    <Button variant="outline" size="sm">
                      Skip
                    </Button>
                  </div>
                </div>
              ))}

              {mockMedications.length === 0 && (
                <div className="text-center py-8">
                  <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No medications for today</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {mockActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {activity.type === 'prescription' && (
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <HeartIcon className="h-4 w-4 text-purple-600" />
                    </div>
                  )}
                  {activity.type === 'appointment' && (
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                  {activity.type === 'message' && (
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}