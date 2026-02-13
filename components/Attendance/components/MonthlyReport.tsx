'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getMonthlyAttendanceReport } from '@api/actions';

interface MonthlyReportData {
  id: number;
  studentId: number;
  studentName: string;
  className: string;
  month: number;
  year: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  totalSchoolDays: number;
  attendancePercentage: number;
}

export function MonthlyReport() {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [reportData, setReportData] = useState<MonthlyReportData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const months = useMemo(() => [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ], []);

  const classes = useMemo(() => [
    { id: '', name: 'All Classes' },
    { id: '1', name: 'Grade 1A' },
    { id: '2', name: 'Grade 2B' },
    { id: '3', name: 'Grade 3C' },
    { id: '4', name: 'Grade 4A' },
  ], []);

  const years = useMemo(() => [2024, 2023, 2022], []);

  const mockReportData = useMemo(() => [
    {
      id: 1,
      studentId: 1,
      studentName: 'John Doe',
      className: 'Grade 1A',
      month: 11,
      year: 2024,
      presentDays: 18,
      absentDays: 2,
      lateDays: 1,
      halfDays: 0,
      totalSchoolDays: 22,
      attendancePercentage: 81.8
    },
    {
      id: 2,
      studentId: 2,
      studentName: 'Jane Smith',
      className: 'Grade 1A',
      month: 11,
      year: 2024,
      presentDays: 20,
      absentDays: 1,
      lateDays: 0,
      halfDays: 1,
      totalSchoolDays: 22,
      attendancePercentage: 90.9
    },
    {
      id: 3,
      studentId: 3,
      studentName: 'Mike Johnson',
      className: 'Grade 1A',
      month: 11,
      year: 2024,
      presentDays: 22,
      absentDays: 0,
      lateDays: 0,
      halfDays: 0,
      totalSchoolDays: 22,
      attendancePercentage: 100
    },
    {
      id: 4,
      studentId: 4,
      studentName: 'Sarah Wilson',
      className: 'Grade 2B',
      month: 11,
      year: 2024,
      presentDays: 19,
      absentDays: 1,
      lateDays: 2,
      halfDays: 0,
      totalSchoolDays: 22,
      attendancePercentage: 86.4
    },
  ], []);

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter mock data based on selections
      let filteredData = mockReportData.filter(
        item => item.month === selectedMonth && item.year === selectedYear
      );
      
      if (selectedClass) {
        const selectedClassName = classes.find(c => c.id === selectedClass)?.name;
        filteredData = filteredData.filter(item => item.className === selectedClassName);
      }
      
      setReportData(filteredData);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear, selectedClass, classes, mockReportData]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 80) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 70) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getOverallStats = () => {
    if (reportData.length === 0) return null;

    const totalStudents = reportData.length;
    const avgPercentage = reportData.reduce((sum, item) => sum + item.attendancePercentage, 0) / totalStudents;
    const perfectAttendance = reportData.filter(item => item.attendancePercentage === 100).length;
    const below80 = reportData.filter(item => item.attendancePercentage < 80).length;

    return { totalStudents, avgPercentage, perfectAttendance, below80 };
  };

  const overallStats = getOverallStats();

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Month
          </label>
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
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
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Class
          </label>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={fetchReport}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400"
          >
            {isLoading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Overall Stats */}
      {overallStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-900">{overallStats.totalStudents}</div>
            <div className="text-sm text-blue-600">Total Students</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-900">{overallStats.avgPercentage.toFixed(1)}%</div>
            <div className="text-sm text-green-600">Average Attendance</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-900">{overallStats.perfectAttendance}</div>
            <div className="text-sm text-purple-600">Perfect Attendance</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-900">{overallStats.below80}</div>
            <div className="text-sm text-orange-600">Below 80%</div>
          </div>
        </div>
      )}

      {/* Report Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Monthly Attendance Report - {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
          </h3>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Generating report...</p>
          </div>
        ) : reportData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Present
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Absent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Late
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Half Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.className}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.presentDays}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.absentDays}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.lateDays}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.halfDays}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.totalSchoolDays}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPercentageColor(student.attendancePercentage)}`}>
                        {student.attendancePercentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">No attendance data found for the selected period.</p>
          </div>
        )}
      </div>

      {/* Export Options */}
      {reportData.length > 0 && (
        <div className="flex justify-end space-x-3">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500">
            Export as PDF
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500">
            Export as Excel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Print Report
          </button>
        </div>
      )}
    </div>
  );
}