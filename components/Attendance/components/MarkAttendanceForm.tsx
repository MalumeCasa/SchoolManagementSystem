'use client';

import { useState, useEffect } from 'react';
import { 
  markAttendance, 
  markClassAttendance, 
  getTodaysClassAttendance,
  getStudentsByClass,
  getClasses,
  type StudentAttendance,
  type AttendanceStatus 
} from '@api/actions';
import { AttendanceStatusBadge } from './AttendanceStatusBadge';

interface Student {
  id: number;
  name: string;
  surname: string;
  className: string;
}

interface ClassInfo {
  id: number;
  className: string;
  classSection: string;
  classTeacher?: string | null;
}

export function MarkAttendanceForm() {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [attendance, setAttendance] = useState<Record<number, StudentAttendance>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch classes on component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const result = await getClasses();
      if (result.success && result.data) {
        // Map the data to match ClassInfo interface
        const classesData: ClassInfo[] = result.data.map(cls => ({
          id: cls.id,
          className: cls.className,
          classSection: cls.classSection,
          classTeacher: cls.classTeacher || undefined
        }));
        setClasses(classesData);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchClassStudents = async (classId: string) => {
    setIsLoading(true);
    try {
      const classIdNum = parseInt(classId);
      
      // Fetch students in the class
      const studentsResult = await getStudentsByClass(classIdNum);
      if (studentsResult.success && studentsResult.data) {
        const studentsData = studentsResult.data.map(student => ({
          id: student.id,
          name: student.name,
          surname: student.name.split(' ')[1] || '',
          className: student.className || ''
        }));
        setStudents(studentsData);
        
        // Initialize attendance state
        const initialAttendance: Record<number, StudentAttendance> = {};
        studentsData.forEach(student => {
          initialAttendance[student.id] = {
            studentId: student.id,
            studentName: student.name,
            status: 'not_recorded'
          };
        });
        setAttendance(initialAttendance);
        
        // Load today's attendance if available
        const todayAttendance = await getTodaysClassAttendance(classIdNum);
        if (todayAttendance.success && todayAttendance.data) {
          const todayData = todayAttendance.data;
          if (todayData.attendance && Array.isArray(todayData.attendance)) {
            todayData.attendance.forEach((record: StudentAttendance) => {
              if (record.studentId && initialAttendance[record.studentId]) {
                initialAttendance[record.studentId] = {
                  ...initialAttendance[record.studentId],
                  status: record.status,
                  remarks: record.remarks,
                  subjectId: record.subjectId,
                  period: record.period
                };
              }
            });
            setAttendance({...initialAttendance});
          }
        }
      } else {
        setStudents([]);
        setAttendance({});
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setMessage({ type: 'error', text: 'Failed to fetch students' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    setMessage(null);
    if (classId) {
      fetchClassStudents(classId);
    } else {
      setStudents([]);
      setAttendance({});
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    // When date changes, clear attendance and reload if class is selected
    if (selectedClass) {
      const initialAttendance: Record<number, StudentAttendance> = {};
      students.forEach(student => {
        initialAttendance[student.id] = {
          studentId: student.id,
          studentName: student.name,
          status: 'not_recorded'
        };
      });
      setAttendance(initialAttendance);
      
      // Optionally: Fetch attendance for the new date
      // fetchAttendanceForDate(date);
    }
  };

  const markStudentAttendance = async (studentId: number, status: AttendanceStatus) => {
    try {
      if (!selectedClass) {
        setMessage({ type: 'error', text: 'Please select a class first' });
        return;
      }

      const attendanceData = {
        studentId,
        classId: parseInt(selectedClass),
        date: selectedDate,
        status,
        recordedBy: 1 // TODO: Replace with actual user ID from session
      };

      const result = await markAttendance(attendanceData);
      
      if (result.success) {
        setAttendance(prev => ({
          ...prev,
          [studentId]: {
            ...prev[studentId],
            status,
            studentId,
            studentName: prev[studentId]?.studentName || students.find(s => s.id === studentId)?.name || ''
          }
        }));
        setMessage({ 
          type: 'success', 
          text: `Attendance marked as ${status} for ${students.find(s => s.id === studentId)?.name}` 
        });
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || 'Failed to mark attendance' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to mark attendance. Please try again.' 
      });
    }
  };

  const markAllAsStatus = async (status: AttendanceStatus) => {
    if (!selectedClass || students.length === 0) {
      setMessage({ type: 'error', text: 'Please select a class with students' });
      return;
    }

    setIsLoading(true);
    try {
      const attendanceList: StudentAttendance[] = students.map(student => ({
        studentId: student.id,
        studentName: student.name,
        status,
        remarks: `Marked all as ${status}`
      }));

      const result = await markClassAttendance(
        parseInt(selectedClass),
        selectedDate,
        attendanceList,
        1 // TODO: Replace with actual user ID from session
      );
      
      if (result.success) {
        // Update local state
        const newAttendance: Record<number, StudentAttendance> = {};
        students.forEach(student => {
          newAttendance[student.id] = {
            studentId: student.id,
            studentName: student.name,
            status,
            remarks: `Marked all as ${status}`
          };
        });
        setAttendance(newAttendance);
        
        setMessage({ 
          type: 'success', 
          text: `All ${students.length} students marked as ${status}` 
        });
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || 'Failed to mark attendance' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to mark attendance for all students' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllAttendance = () => {
    const clearedAttendance: Record<number, StudentAttendance> = {};
    students.forEach(student => {
      clearedAttendance[student.id] = {
        studentId: student.id,
        studentName: student.name,
        status: 'not_recorded'
      };
    });
    setAttendance(clearedAttendance);
    setMessage({ 
      type: 'success', 
      text: 'Attendance cleared for all students' 
    });
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  };

  const saveAttendance = async () => {
    if (!selectedClass || students.length === 0) {
      setMessage({ type: 'error', text: 'No attendance to save' });
      return;
    }

    setIsLoading(true);
    try {
      // Filter out students with 'not_recorded' status
      const attendanceList: StudentAttendance[] = Object.values(attendance)
        .filter(record => record.status !== 'not_recorded')
        .map(record => ({
          ...record,
          status: record.status as AttendanceStatus
        }));

      if (attendanceList.length === 0) {
        setMessage({ type: 'error', text: 'No attendance records to save' });
        setIsLoading(false);
        return;
      }

      const result = await markClassAttendance(
        parseInt(selectedClass),
        selectedDate,
        attendanceList,
        1 // TODO: Replace with actual user ID from session
      );
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `Successfully saved ${attendanceList.length} attendance records` 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || 'Failed to save attendance' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to save attendance. Please try again.' 
      });
    } finally {
      setIsLoading(false);
      
      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const getAttendanceStats = () => {
    const present = Object.values(attendance).filter(record => record.status === 'present').length;
    const absent = Object.values(attendance).filter(record => record.status === 'absent').length;
    const late = Object.values(attendance).filter(record => record.status === 'late').length;
    const halfDay = Object.values(attendance).filter(record => record.status === 'half-day').length;
    const notRecorded = Object.values(attendance).filter(record => record.status === 'not_recorded').length;
    const total = students.length;

    return { present, absent, late, halfDay, notRecorded, total };
  };

  const stats = getAttendanceStats();

  return (
    <div className="space-y-6">
      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex">
            <div className={`flex-shrink-0 ${
              message.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`}>
              {message.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Class
          </label>
          <select 
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value="">Choose a class...</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id.toString()}>
                {cls.className} {cls.classSection && `- ${cls.classSection}`}
                {cls.classTeacher && ` (${cls.classTeacher})`}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!selectedClass || isLoading}
          />
        </div>

        <div className="flex items-end space-x-2">
          <button
            onClick={() => markAllAsStatus('present')}
            disabled={!selectedClass || isLoading || students.length === 0}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Mark All Present
          </button>
          <button
            onClick={clearAllAttendance}
            disabled={!selectedClass || isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Stats */}
      {selectedClass && students.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-xl font-bold text-green-900">{stats.present}</div>
            <div className="text-xs text-green-600">Present</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-xl font-bold text-red-900">{stats.absent}</div>
            <div className="text-xs text-red-600">Absent</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-xl font-bold text-yellow-900">{stats.late}</div>
            <div className="text-xs text-yellow-600">Late</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="text-xl font-bold text-purple-900">{stats.halfDay}</div>
            <div className="text-xs text-purple-600">Half Day</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-xl font-bold text-gray-900">{stats.notRecorded}</div>
            <div className="text-xs text-gray-600">Not Recorded</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-xl font-bold text-blue-900">{stats.total}</div>
            <div className="text-xs text-blue-600">Total Students</div>
          </div>
        </div>
      )}

      {/* Students List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading students...</p>
        </div>
      ) : selectedClass && students.length > 0 ? (
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 rounded-lg font-medium text-sm text-gray-700">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Student Name</div>
            <div className="col-span-3">Class</div>
            <div className="col-span-4 text-center">Attendance Status</div>
          </div>
          
          {students.map((student, index) => (
            <div
              key={student.id}
              className="grid grid-cols-12 gap-2 items-center p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="col-span-1 font-medium text-gray-500">
                {index + 1}
              </div>
              
              <div className="col-span-4">
                <h3 className="font-medium text-gray-900">
                  {student.name}
                </h3>
                <p className="text-sm text-gray-500">ID: {student.id}</p>
              </div>
              
              <div className="col-span-3">
                <p className="text-sm text-gray-700">{student.className}</p>
              </div>

              <div className="col-span-4">
                <div className="flex items-center justify-center space-x-2">
                  {(['present', 'absent', 'late', 'half-day'] as AttendanceStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => markStudentAttendance(student.id, status)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        attendance[student.id]?.status === status
                          ? status === 'present'
                            ? 'bg-green-100 text-green-800 border-2 border-green-300'
                            : status === 'absent'
                            ? 'bg-red-100 text-red-800 border-2 border-red-300'
                            : status === 'late'
                            ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                            : 'bg-purple-100 text-purple-800 border-2 border-purple-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="text-center mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    attendance[student.id]?.status === 'present' ? 'bg-green-100 text-green-800' :
                    attendance[student.id]?.status === 'absent' ? 'bg-red-100 text-red-800' :
                    attendance[student.id]?.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                    attendance[student.id]?.status === 'half-day' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {attendance[student.id]?.status?.replace('_', ' ').toUpperCase() || 'NOT RECORDED'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : selectedClass ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
          <p className="text-gray-600">There are no students in this class.</p>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">🏫</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Class</h3>
          <p className="text-gray-600">Choose a class to start marking attendance.</p>
        </div>
      )}

      {/* Save Button */}
      {selectedClass && students.length > 0 && (
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {Object.values(attendance).filter(record => record.status !== 'not_recorded').length} of {students.length} students attendance recorded
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => markAllAsStatus('absent')}
              disabled={isLoading}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium disabled:bg-gray-100 disabled:text-gray-400"
            >
              Mark All Absent
            </button>
            <button
              onClick={saveAttendance}
              disabled={isLoading || Object.values(attendance).filter(record => record.status !== 'not_recorded').length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}