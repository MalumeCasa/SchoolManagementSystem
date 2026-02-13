'use client';

import { useState } from 'react';

export function ClassComparison() {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Mock data for class comparison
  const classData = [
    { className: 'Grade 1A', totalStudents: 25, avgAttendance: 94.2, present: 23, absent: 1, late: 1 },
    { className: 'Grade 2B', totalStudents: 28, avgAttendance: 96.8, present: 27, absent: 0, late: 1 },
    { className: 'Grade 3C', totalStudents: 30, avgAttendance: 92.5, present: 28, absent: 1, late: 1 },
    { className: 'Grade 4A', totalStudents: 27, avgAttendance: 89.7, present: 24, absent: 2, late: 1 },
    { className: 'Grade 5B', totalStudents: 26, avgAttendance: 95.1, present: 25, absent: 0, late: 1 },
  ];

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 95) return 'text-green-600';
    if (percentage >= 90) return 'text-yellow-600';
    if (percentage >= 85) return 'text-orange-600';
    return 'text-red-600';
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 95) return 'bg-green-500';
    if (percentage >= 90) return 'bg-yellow-500';
    if (percentage >= 85) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Month
          </label>
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>January</option>
            <option value={2}>February</option>
            <option value={3}>March</option>
            <option value={4}>April</option>
            <option value={5}>May</option>
            <option value={6}>June</option>
            <option value={7}>July</option>
            <option value={8}>August</option>
            <option value={9}>September</option>
            <option value={10}>October</option>
            <option value={11}>November</option>
            <option value={12}>December</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Year
          </label>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
            <option value={2022}>2022</option>
          </select>
        </div>

        <div className="flex items-end">
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Update Comparison
          </button>
        </div>
      </div>

      {/* Class Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classData.map((classInfo, index) => (
          <div key={classInfo.className} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{classInfo.className}</h3>
              <span className={`text-2xl font-bold ${getAttendanceColor(classInfo.avgAttendance)}`}>
                {classInfo.avgAttendance}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className={`h-2 rounded-full ${getBarColor(classInfo.avgAttendance)}`}
                style={{ width: `${classInfo.avgAttendance}%` }}
              ></div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Total Students</div>
                <div className="font-semibold text-gray-900">{classInfo.totalStudents}</div>
              </div>
              <div>
                <div className="text-gray-600">Present</div>
                <div className="font-semibold text-green-600">{classInfo.present}</div>
              </div>
              <div>
                <div className="text-gray-600">Absent</div>
                <div className="font-semibold text-red-600">{classInfo.absent}</div>
              </div>
              <div>
                <div className="text-gray-600">Late</div>
                <div className="font-semibold text-yellow-600">{classInfo.late}</div>
              </div>
            </div>

            {/* Rank */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rank</span>
                <span className="text-lg font-bold text-blue-600">#{index + 1}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.max(...classData.map(c => c.avgAttendance))}%
            </div>
            <div className="text-sm text-gray-600">Highest Attendance</div>
            <div className="text-xs text-gray-500">
              {classData.find(c => c.avgAttendance === Math.max(...classData.map(c => c.avgAttendance)))?.className}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {Math.min(...classData.map(c => c.avgAttendance))}%
            </div>
            <div className="text-sm text-gray-600">Lowest Attendance</div>
            <div className="text-xs text-gray-500">
              {classData.find(c => c.avgAttendance === Math.min(...classData.map(c => c.avgAttendance)))?.className}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {(classData.reduce((sum, c) => sum + c.avgAttendance, 0) / classData.length).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Average Attendance</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {classData.reduce((sum, c) => sum + c.totalStudents, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
        </div>
      </div>
    </div>
  );
}