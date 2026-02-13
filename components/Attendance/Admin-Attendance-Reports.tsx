'use client';

import { useState } from 'react';
import { MonthlyReport } from './components/MonthlyReport';
import { ClassComparison } from './components/ClassComparison';

export default function AdminAttendanceReportsPage({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<'monthly' | 'comparison' | 'trends'>('monthly');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Attendance Reports</h1>
          <p className="text-gray-600 mt-2">Generate detailed attendance reports and analytics</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'monthly', name: 'Monthly Report', icon: '📊' },
                { id: 'comparison', name: 'Class Comparison', icon: '📈' },
                { id: 'trends', name: 'Trend Analysis', icon: '📋' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'monthly' && <MonthlyReport />}
            {activeTab === 'comparison' && <ClassComparison />}
            {activeTab === 'trends' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Trend Analysis</h3>
                <p className="text-gray-600">Coming soon - Track attendance trends over time</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}