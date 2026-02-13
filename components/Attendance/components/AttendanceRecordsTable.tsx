'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAttendanceRecords } from '@api/actions';
import { AttendanceStatusBadge } from './AttendanceStatusBadge';

// Use the exact interface from your actions with proper status type
interface AttendanceRecord {
  id: number;
  studentId: number;
  classId: number;
  date: string;
  status: string; // Changed to string to match API response
  subjectId?: number | null;
  remarks?: string | null;
  recordedBy?: number | null;
  createdAt: string | null;
  studentName?: string;
  className?: string | null;
}

interface AttendanceRecordsTableProps {
  classId?: number;
  date?: string;
}

export function AttendanceRecordsTable({ classId, date }: AttendanceRecordsTableProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: any = {};
      if (classId) filters.classId = classId;
      if (date) filters.date = date;

      const result = await getAttendanceRecords(filters);
      if (result.success && result.data) {
        setRecords(result.data);
      } else {
        console.error('Error fetching records:', result.error);
        setRecords([]);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [classId, date]); // Add dependencies

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]); // Now includes fetchRecords

  // Mock data for demonstration (with proper types)
  const mockRecords: AttendanceRecord[] = [
    {
      id: 1,
      studentId: 1,
      classId: 1,
      studentName: 'John Doe',
      className: 'Grade 1A',
      date: '2024-11-15',
      status: 'present',
      remarks: '',
      createdAt: '2024-11-15T08:30:00Z'
    },
    {
      id: 2,
      studentId: 2,
      classId: 1,
      studentName: 'Jane Smith',
      className: 'Grade 1A',
      date: '2024-11-15',
      status: 'absent',
      remarks: 'Sick',
      createdAt: '2024-11-15T08:30:00Z'
    },
    {
      id: 3,
      studentId: 3,
      classId: 1,
      studentName: 'Mike Johnson',
      className: 'Grade 1A',
      date: '2024-11-15',
      status: 'late',
      remarks: 'Traffic',
      createdAt: '2024-11-15T09:15:00Z'
    },
    {
      id: 4,
      studentId: 4,
      classId: 2,
      studentName: 'Sarah Wilson',
      className: 'Grade 2B',
      date: '2024-11-15',
      status: 'present',
      remarks: '',
      createdAt: '2024-11-15T08:30:00Z'
    },
    {
      id: 5,
      studentId: 5,
      classId: 2,
      studentName: 'Tom Brown',
      className: 'Grade 2B',
      date: '2024-11-15',
      status: 'half-day',
      remarks: 'Doctor appointment',
      createdAt: '2024-11-15T08:30:00Z'
    },
  ];

  // For now, using mock data - remove this when API is ready
  const displayRecords = records.length > 0 ? records : mockRecords;

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = displayRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(displayRecords.length / recordsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Type guard for status
  const isValidStatus = (status: string): status is 'present' | 'absent' | 'late' | 'half-day' => {
    return ['present', 'absent', 'late', 'half-day'].includes(status);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading attendance records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {currentRecords.length} of {displayRecords.length} records
        </p>
        <button
          onClick={fetchRecords}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Remarks
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recorded
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{record.studentName || `Student ${record.studentId}`}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{record.className || `Class ${record.classId}`}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(record.date)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <AttendanceStatusBadge 
                    status={isValidStatus(record.status) ? record.status : 'absent'} 
                    size="sm" 
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {record.remarks || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {record.createdAt ? new Date(record.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '-'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <div className="flex justify-between flex-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </span>
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {displayRecords.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Records Found</h3>
          <p className="text-gray-600">No attendance records match your current filters.</p>
        </div>
      )}
    </div>
  );
}