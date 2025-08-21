'use client';

import { useState } from 'react';
import { 
  HeartIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock data - replace with actual API calls
const mockMedications = [
  {
    id: '1',
    name: 'Aspirin 75mg',
    dosage: '1 tablet daily',
    frequency: 'Once daily',
    nextDose: '2:00 PM',
    timeRemaining: '2 hours',
    adherence: 85,
    prescribedBy: 'Dr. Sarah Wilson',
    startDate: '2025-08-01',
    endDate: '2025-08-31',
    instructions: 'Take with food to avoid stomach upset',
    status: 'ACTIVE'
  },
  {
    id: '2',
    name: 'Lisinopril 10mg',
    dosage: '1 tablet daily',
    frequency: 'Once daily',
    nextDose: '8:00 AM',
    timeRemaining: 'Tomorrow',
    adherence: 92,
    prescribedBy: 'Dr. Sarah Wilson',
    startDate: '2025-07-15',
    endDate: '2025-09-15',
    instructions: 'Take at the same time each day',
    status: 'ACTIVE'
  },
  {
    id: '3',
    name: 'Metformin 500mg',
    dosage: '2 tablets daily',
    frequency: 'Twice daily',
    nextDose: '6:00 PM',
    timeRemaining: '6 hours',
    adherence: 78,
    prescribedBy: 'Dr. Rajesh Kumar',
    startDate: '2025-07-01',
    endDate: '2025-12-31',
    instructions: 'Take with meals',
    status: 'ACTIVE'
  },
  {
    id: '4',
    name: 'Amoxicillin 250mg',
    dosage: '3 tablets daily',
    frequency: 'Three times daily',
    nextDose: 'Completed',
    timeRemaining: 'Course finished',
    adherence: 95,
    prescribedBy: 'Dr. Priya Sharma',
    startDate: '2025-07-20',
    endDate: '2025-07-27',
    instructions: 'Complete the full course',
    status: 'COMPLETED'
  }
];

const mockDosesToday = [
  {
    id: '1',
    medicationName: 'Aspirin 75mg',
    scheduledTime: '8:00 AM',
    status: 'TAKEN',
    takenAt: '8:15 AM'
  },
  {
    id: '2',
    medicationName: 'Metformin 500mg',
    scheduledTime: '12:00 PM',
    status: 'TAKEN',
    takenAt: '12:30 PM'
  },
  {
    id: '3',
    medicationName: 'Aspirin 75mg',
    scheduledTime: '2:00 PM',
    status: 'PENDING',
    takenAt: null
  },
  {
    id: '4',
    medicationName: 'Metformin 500mg',
    scheduledTime: '6:00 PM',
    status: 'SCHEDULED',
    takenAt: null
  },
  {
    id: '5',
    medicationName: 'Lisinopril 10mg',
    scheduledTime: '8:00 PM',
    status: 'SCHEDULED',
    takenAt: null
  }
];

export default function MedicationsPage() {
  const [activeTab, setActiveTab] = useState('active');

  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 90) return 'text-success-600 bg-success-500';
    if (adherence >= 70) return 'text-warning-600 bg-warning-500';
    return 'text-error-600 bg-error-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-success-600 bg-success-50 border-success-200';
      case 'COMPLETED':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'PAUSED':
        return 'text-warning-600 bg-warning-50 border-warning-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDoseStatusColor = (status: string) => {
    switch (status) {
      case 'TAKEN':
        return 'text-success-600 bg-success-50';
      case 'PENDING':
        return 'text-warning-600 bg-warning-50';
      case 'SCHEDULED':
        return 'text-blue-600 bg-blue-50';
      case 'MISSED':
        return 'text-error-600 bg-error-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredMedications = mockMedications.filter(med => {
    if (activeTab === 'active') return med.status === 'ACTIVE';
    if (activeTab === 'completed') return med.status === 'COMPLETED';
    return true;
  });

  const activeMedications = mockMedications.filter(med => med.status === 'ACTIVE');
  const todaysPendingDoses = mockDosesToday.filter(dose => dose.status === 'PENDING').length;
  const todaysCompletedDoses = mockDosesToday.filter(dose => dose.status === 'TAKEN').length;
  const overallAdherence = Math.round(
    mockMedications.reduce((sum, med) => sum + med.adherence, 0) / mockMedications.length
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Medications</h1>
            <p className="text-gray-600 mt-1">Track and manage your medication schedule</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HeartIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{activeMedications.length}</p>
                <p className="text-sm text-gray-600">Active Medications</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{todaysPendingDoses}</p>
                <p className="text-sm text-gray-600">Pending Today</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{todaysCompletedDoses}</p>
                <p className="text-sm text-gray-600">Taken Today</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getAdherenceColor(overallAdherence).split(' ')[1]}`}>
                  <span className="text-white text-sm font-bold">{overallAdherence}%</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{overallAdherence}%</p>
                <p className="text-sm text-gray-600">Adherence Rate</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Today's Schedule</h2>
            <div className="space-y-4">
              {mockDosesToday.map((dose) => (
                <div key={dose.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{dose.medicationName}</h4>
                    <p className="text-xs text-gray-600">{dose.scheduledTime}</p>
                    {dose.takenAt && (
                      <p className="text-xs text-success-600">Taken at {dose.takenAt}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDoseStatusColor(dose.status)}`}>
                      {dose.status}
                    </span>
                    {dose.status === 'PENDING' && (
                      <Button size="sm">
                        Mark Taken
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Medications List */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'active', label: 'Active', count: mockMedications.filter(m => m.status === 'ACTIVE').length },
                  { key: 'completed', label: 'Completed', count: mockMedications.filter(m => m.status === 'COMPLETED').length },
                  { key: 'all', label: 'All', count: mockMedications.length }
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

            <div className="space-y-4">
              {filteredMedications.map((medication) => (
                <Card key={medication.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          💊 {medication.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(medication.status)}`}>
                          {medication.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{medication.dosage} • {medication.frequency}</p>
                      <p className="text-xs text-gray-500">Prescribed by {medication.prescribedBy}</p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAdherenceColor(medication.adherence)}`}>
                        {medication.adherence}% adherence
                      </div>
                    </div>
                  </div>

                  {medication.status === 'ACTIVE' && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-900">Next dose: {medication.nextDose}</p>
                          <p className="text-xs text-blue-700">{medication.timeRemaining}</p>
                        </div>
                        <Button size="sm">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Mark as Taken
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span>
                        {new Date(medication.startDate).toLocaleDateString()} - {new Date(medication.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getAdherenceColor(medication.adherence).split(' ')[1]}`}
                        style={{ width: `${medication.adherence}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Instructions:</span> {medication.instructions}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      View History
                    </Button>
                    <Button variant="outline" size="sm">
                      Set Reminder
                    </Button>
                    {medication.status === 'ACTIVE' && (
                      <Button variant="ghost" size="sm">
                        Pause
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {filteredMedications.length === 0 && (
              <Card className="p-12 text-center">
                <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {activeTab} medications
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'active' 
                    ? "You don't have any active medications."
                    : `No ${activeTab} medications found.`
                  }
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}