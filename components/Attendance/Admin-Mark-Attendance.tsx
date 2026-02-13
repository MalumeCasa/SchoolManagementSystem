'use client';

import { useState, useEffect } from 'react';
import { MarkAttendanceForm } from '@components/Attendance/components/MarkAttendanceForm';

export default function AdminMarkAttendancePage({ user }: { user: any }) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
              <p className="text-gray-600 mt-2">Take daily attendance for classes and students</p>
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {/* Attendance Form */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Class Attendance</h2>
          </div>
          <div className="p-6">
            <MarkAttendanceForm />
          </div>
        </div>
      </div>
    </div>
  );
}