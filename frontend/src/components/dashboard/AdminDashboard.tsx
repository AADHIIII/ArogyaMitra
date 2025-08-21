'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserGroupIcon, 
  CalendarIcon, 
  ClipboardDocumentListIcon,
  ChartBarIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

// Mock data - replace with actual API calls
const mockStats = {
  totalUsers: 1247,
  totalDoctors: 89,
  todayAppointments: 156,
  totalRevenue: 2450000
};

const mockRecentActivity = [
  {
    id: '1',
    type: 'user_registration',
    message: 'New patient registered: John Doe',
    time: '5 minutes ago',
    status: 'info'
  },
  {
    id: '2',
    type: 'doctor_verification',
    message: 'Doctor verification pending: Dr. Sarah Wilson',
    time: '15 minutes ago',
    status: 'warning'
  },
  {
    id: '3',
    type: 'appointment_completed',
    message: 'Appointment completed successfully',
    time: '30 minutes ago',
    status: 'success'
  }
];

const mockAlerts = [
  {
    id: '1',
    type: 'warning',
    message: '3 doctor verifications pending',
    action: 'Review Now'
  },
  {
    id: '2',
    type: 'info',
    message: 'System maintenance scheduled for tonight',
    action: 'View Details'
  }
];

export default function AdminDashboard() {
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            {getGreeting()}, {user?.firstName}! 👨‍💼
          </h1>
          <p className="text-primary-100">
            System overview and management dashboard
          </p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{mockStats.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/users">
                <Button variant="outline" size="sm" className="w-full">
                  Manage Users
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{mockStats.totalDoctors}</p>
                <p className="text-sm text-gray-600">Active Doctors</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/doctors">
                <Button variant="outline" size="sm" className="w-full">
                  Manage Doctors
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{mockStats.todayAppointments}</p>
                <p className="text-sm text-gray-600">Today's Appointments</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/appointments">
                <Button variant="outline" size="sm" className="w-full">
                  View Appointments
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">₹{(mockStats.totalRevenue / 100000).toFixed(1)}L</p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/reports">
                <Button variant="outline" size="sm" className="w-full">
                  View Reports
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* System Alerts */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">System Alerts</h2>
              <BellIcon className="h-5 w-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {mockAlerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border ${
                  alert.type === 'warning' ? 'bg-warning-50 border-warning-200' : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {alert.type === 'warning' ? (
                        <ExclamationTriangleIcon className="h-5 w-5 text-warning-600" />
                      ) : (
                        <BellIcon className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm text-gray-900">{alert.message}</p>
                      <Button variant="link" size="sm" className="p-0 h-auto mt-1">
                        {alert.action}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <Link href="/admin/activity">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {mockRecentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {activity.status === 'success' && (
                        <div className="h-8 w-8 bg-success-100 rounded-full flex items-center justify-center">
                          <CheckCircleIcon className="h-4 w-4 text-success-600" />
                        </div>
                      )}
                      {activity.status === 'warning' && (
                        <div className="h-8 w-8 bg-warning-100 rounded-full flex items-center justify-center">
                          <ExclamationTriangleIcon className="h-4 w-4 text-warning-600" />
                        </div>
                      )}
                      {activity.status === 'info' && (
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserGroupIcon className="h-4 w-4 text-blue-600" />
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
        </div>

        {/* Quick Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 text-center">
            <UserGroupIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
            <p className="text-sm text-gray-600 mb-4">Manage patients and doctors</p>
            <Link href="/admin/users">
              <Button className="w-full">Manage Users</Button>
            </Link>
          </Card>

          <Card className="p-6 text-center">
            <CalendarIcon className="h-12 w-12 text-success-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Appointments</h3>
            <p className="text-sm text-gray-600 mb-4">Monitor all appointments</p>
            <Link href="/admin/appointments">
              <Button className="w-full">View Appointments</Button>
            </Link>
          </Card>

          <Card className="p-6 text-center">
            <ChartBarIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-sm text-gray-600 mb-4">System performance metrics</p>
            <Link href="/admin/analytics">
              <Button className="w-full">View Analytics</Button>
            </Link>
          </Card>

          <Card className="p-6 text-center">
            <BellIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notifications</h3>
            <p className="text-sm text-gray-600 mb-4">Send system notifications</p>
            <Link href="/admin/notifications">
              <Button className="w-full">Manage Notifications</Button>
            </Link>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}