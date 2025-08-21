'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CalendarIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

// Mock data - replace with actual API calls
const mockTodayAppointments = [
  {
    id: '1',
    patientName: 'John Doe',
    time: '9:00 AM',
    type: 'General Consultation',
    status: 'CONFIRMED',
    duration: '30 min'
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    time: '9:30 AM',
    type: 'Follow-up',
    status: 'CONFIRMED',
    duration: '15 min'
  },
  {
    id: '3',
    patientName: 'Mike Johnson',
    time: '10:00 AM',
    type: 'New Patient',
    status: 'PENDING',
    duration: '45 min'
  }
];

const mockStats = {
  todayPatients: 8,
  todayEarnings: 9600,
  totalHours: 6,
  prescriptionsWritten: 3
};

const mockRecentMessages = [
  {
    id: '1',
    patientName: 'John Doe',
    message: 'Question about medication dosage',
    time: '10 minutes ago',
    unread: true
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    message: 'Thank you for the consultation',
    time: '1 hour ago',
    unread: false
  }
];

export default function DoctorDashboard() {
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
      case 'IN_PROGRESS':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const nextAppointment = mockTodayAppointments.find(apt => apt.status === 'CONFIRMED');

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            {getGreeting()}, Dr. {user?.lastName}! 👨‍⚕️
          </h1>
          <p className="text-primary-100">
            You have {mockTodayAppointments.length} appointments today
            {nextAppointment && ` • Next: ${nextAppointment.patientName} at ${nextAppointment.time}`}
          </p>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{mockStats.todayPatients}</p>
                <p className="text-sm text-gray-600">Patients Today</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">₹{mockStats.todayEarnings.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Today's Earnings</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{mockStats.totalHours}</p>
                <p className="text-sm text-gray-600">Hours Scheduled</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardDocumentListIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{mockStats.prescriptionsWritten}</p>
                <p className="text-sm text-gray-600">Prescriptions</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
                <Link href="/schedule">
                  <Button variant="outline" size="sm">
                    View Calendar
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {mockTodayAppointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-medium text-gray-900">{appointment.patientName}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{appointment.type}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {appointment.time} • {appointment.duration}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      {appointment.status === 'CONFIRMED' && (
                        <Button size="sm">
                          <PlayIcon className="h-4 w-4 mr-1" />
                          Start Consultation
                        </Button>
                      )}
                      {appointment.status === 'PENDING' && (
                        <Button size="sm">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Confirm
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}

                {mockTodayAppointments.length === 0 && (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No appointments scheduled for today</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Quick Actions & Messages */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/schedule/add-slot">
                  <Button variant="outline" className="w-full justify-start">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Available Slot
                  </Button>
                </Link>
                <Link href="/patients">
                  <Button variant="outline" className="w-full justify-start">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    View Patient Records
                  </Button>
                </Link>
                <Link href="/prescriptions">
                  <Button variant="outline" className="w-full justify-start">
                    <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                    Manage Prescriptions
                  </Button>
                </Link>
                <Link href="/reports">
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    View Reports
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Recent Messages */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Messages</h2>
                <Link href="/messages">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {mockRecentMessages.map((message) => (
                  <div key={message.id} className={`p-3 rounded-lg border ${message.unread ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900">{message.patientName}</h4>
                          {message.unread && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{message.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{message.time}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {mockRecentMessages.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600">No recent messages</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}