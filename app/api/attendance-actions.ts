// app/actions/attendance-actions.ts
'use server';

import { db } from '@/api/db';
import {
  studentAttendance,
  classes,
  students,
  subjects,
  users,
  dailyAttendanceView,
  attendanceSummary
} from '@lib/db/schema';
import { eq, and, desc, asc, sql, between, gte, lte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { startOfMonth, endOfMonth, format } from 'date-fns';

// Type definitions
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half-day';

// Type guard function
function isValidAttendanceStatus(status: string): status is AttendanceStatus {
  return status === 'present' || status === 'absent' || 
         status === 'late' || status === 'half-day';
}

export interface AttendanceRecord {
  id: number;
  studentId: number;
  classId: number;
  date: string;
  status: AttendanceStatus;
  subjectId?: number;
  period?: number;
  remarks?: string;
  recordedBy?: number;
  createdAt: string;

  // Joined fields
  studentName?: string;
  className?: string;
  recordedByName?: string;
  subjectName?: string;
}

export interface NewAttendanceRecord {
  studentId: number;
  classId: number;
  date: string;
  status: AttendanceStatus;
  subjectId?: number;
  period?: number;
  remarks?: string;
  recordedBy?: number;
}

export interface AttendanceFilters {
  studentId?: number;
  classId?: number;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
  month?: number;
  year?: number;
  subjectId?: number;
}

export interface AttendanceSummaryData {
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  attendancePercentage: number;
  date?: string;
  className?: string;
}

export interface ClassAttendance {
  classId: number;
  className: string;
  date: string;
  attendance: StudentAttendance[];
}

export interface StudentAttendance {
  studentId: number;
  studentName: string;
  status: AttendanceStatus | 'not_recorded';
  remarks?: string;
  subjectId?: number;
  period?: number;
}

// Mark attendance for a single student
export async function markAttendance(data: NewAttendanceRecord) {
  try {
    // Build conditions array
    const conditions = [
      eq(studentAttendance.studentId, data.studentId),
      eq(studentAttendance.date, data.date),
    ];

    if (data.subjectId !== undefined) {
      conditions.push(eq(studentAttendance.subjectId, data.subjectId));
    }

    if (data.period !== undefined) {
      conditions.push(eq(studentAttendance.period, data.period));
    }

    // Check if attendance already exists for this student on this date
    const existingAttendance = await db
      .select()
      .from(studentAttendance)
      .where(and(...conditions))
      .limit(1);

    if (existingAttendance.length > 0) {
      // Update existing attendance
      const [updatedAttendance] = await db
        .update(studentAttendance)
        .set({
          status: data.status,
          remarks: data.remarks,
          recordedBy: data.recordedBy,
        })
        .where(eq(studentAttendance.id, existingAttendance[0].id))
        .returning();

      revalidatePath('/attendance');
      return { success: true, data: updatedAttendance, message: 'Attendance updated successfully' };
    }

    // Create new attendance record
    const [newAttendance] = await db
      .insert(studentAttendance)
      .values(data)
      .returning();

    revalidatePath('/attendance');
    return { success: true, data: newAttendance, message: 'Attendance marked successfully' };
  } catch (error) {
    console.error('Error marking attendance:', error);
    return { success: false, error: 'Failed to mark attendance' };
  }
}

// Mark attendance for an entire class
export async function markClassAttendance(classId: number, date: string, attendanceList: StudentAttendance[], recordedBy?: number) {
  try {
    const today = date || format(new Date(), 'yyyy-MM-dd');
    const results = [];
    const errors = [];

    // Get class information
    const [classInfo] = await db
      .select()
      .from(classes)
      .where(eq(classes.id, classId));

    if (!classInfo) {
      return { success: false, error: 'Class not found' };
    }

    // Get students in the class (from registered_students based on class name)
    const classStudents = await db
      .select({
        id: students.id,
        name: students.name,
        surname: students.surname,
      })
      .from(students)
      .where(eq(students.class, classInfo.className));

    for (const studentAtt of attendanceList) {
      try {
        // Skip if status is 'not_recorded'
        if (studentAtt.status === 'not_recorded') {
          continue;
        }

        // Find student by ID or name
        let student;
        if (studentAtt.studentId) {
          student = classStudents.find(s => s.id === studentAtt.studentId);
        } else {
          student = classStudents.find(s =>
            `${s.name} ${s.surname}`.toLowerCase().includes(studentAtt.studentName.toLowerCase())
          );
        }

        if (!student) {
          errors.push({
            studentName: studentAtt.studentName,
            error: 'Student not found in this class',
          });
          continue;
        }

        const attendanceData: NewAttendanceRecord = {
          studentId: student.id,
          classId,
          date: today,
          status: studentAtt.status as AttendanceStatus,
          remarks: studentAtt.remarks,
          subjectId: studentAtt.subjectId,
          period: studentAtt.period,
          recordedBy,
        };

        // Build conditions for existing attendance check
        const conditions = [
          eq(studentAttendance.studentId, student.id),
          eq(studentAttendance.date, today),
          eq(studentAttendance.classId, classId),
        ];

        if (studentAtt.subjectId !== undefined) {
          conditions.push(eq(studentAttendance.subjectId, studentAtt.subjectId));
        }

        if (studentAtt.period !== undefined) {
          conditions.push(eq(studentAttendance.period, studentAtt.period));
        }

        // Check if attendance already exists
        const existingAttendance = await db
          .select()
          .from(studentAttendance)
          .where(and(...conditions))
          .limit(1);

        if (existingAttendance.length > 0) {
          // Update existing
          const [updated] = await db
            .update(studentAttendance)
            .set({
              status: studentAtt.status as AttendanceStatus,
              remarks: studentAtt.remarks,
            })
            .where(eq(studentAttendance.id, existingAttendance[0].id))
            .returning();

          results.push(updated);
        } else {
          // Create new
          const [newRecord] = await db
            .insert(studentAttendance)
            .values(attendanceData)
            .returning();

          results.push(newRecord);
        }
      } catch (error) {
        errors.push({
          studentName: studentAtt.studentName,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    revalidatePath('/attendance');
    return {
      success: errors.length === 0,
      data: results,
      errors,
      message: `Attendance marked for ${results.length} students${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
    };
  } catch (error) {
    console.error('Error marking class attendance:', error);
    return { success: false, error: 'Failed to mark class attendance' };
  }
}

// Get attendance records with filters
export async function getAttendanceRecords(filters: AttendanceFilters = {}) {
  try {
    // Start building the query with explicit typing
    const baseQuery = db
      .select({
        id: studentAttendance.id,
        studentId: studentAttendance.studentId,
        classId: studentAttendance.classId,
        date: studentAttendance.date,
        status: studentAttendance.status,
        subjectId: studentAttendance.subjectId,
        period: studentAttendance.period,
        remarks: studentAttendance.remarks,
        recordedBy: studentAttendance.recordedBy,
        createdAt: studentAttendance.createdAt,
        studentName: sql<string>`CONCAT(${students.name}, ' ', ${students.surname})`.as('student_name'),
        className: classes.className,
        recordedByName: users.fullName,
        subjectName: subjects.name,
      })
      .from(studentAttendance)
      .leftJoin(students, eq(studentAttendance.studentId, students.id))
      .leftJoin(classes, eq(studentAttendance.classId, classes.id))
      .leftJoin(users, eq(studentAttendance.recordedBy, users.id))
      .leftJoin(subjects, eq(studentAttendance.subjectId, subjects.id));

    // Build conditions array
    const conditions = [];

    if (filters.studentId) {
      conditions.push(eq(studentAttendance.studentId, filters.studentId));
    }

    if (filters.classId) {
      conditions.push(eq(studentAttendance.classId, filters.classId));
    }

    if (filters.startDate && filters.endDate) {
      conditions.push(
        between(studentAttendance.date, filters.startDate, filters.endDate)
      );
    } else if (filters.startDate) {
      conditions.push(gte(studentAttendance.date, filters.startDate));
    } else if (filters.endDate) {
      conditions.push(lte(studentAttendance.date, filters.endDate));
    }

    if (filters.status) {
      conditions.push(eq(studentAttendance.status, filters.status));
    }

    if (filters.subjectId) {
      conditions.push(eq(studentAttendance.subjectId, filters.subjectId));
    }

    if (filters.month && filters.year) {
      const startDate = new Date(filters.year, filters.month - 1, 1);
      const endDate = new Date(filters.year, filters.month, 0);
      conditions.push(
        between(studentAttendance.date, format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'))
      );
    }

    // Apply conditions if any exist
    if (conditions.length > 0) {
      const queryWithConditions = baseQuery.where(and(...conditions));
      const records = await queryWithConditions.orderBy(desc(studentAttendance.date), asc(students.name));
      return { success: true, data: records };
    } else {
      const records = await baseQuery.orderBy(desc(studentAttendance.date), asc(students.name));
      return { success: true, data: records };
    }
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return { success: false, error: 'Failed to fetch attendance records' };
  }
}

// Get today's attendance for a specific class
export async function getTodaysClassAttendance(classId: number) {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Get class information
    const [classInfo] = await db
      .select({
        id: classes.id,
        className: classes.className,
      })
      .from(classes)
      .where(eq(classes.id, classId));

    if (!classInfo) {
      return { success: false, error: 'Class not found' };
    }

    // Get students in the class
    const classStudents = await db
      .select({
        id: students.id,
        name: sql<string>`CONCAT(${students.name}, ' ', ${students.surname})`.as('student_name'),
      })
      .from(students)
      .where(eq(students.class, classInfo.className))
      .orderBy(asc(students.name));

    // Get today's attendance
    const todayAttendance = await db
      .select()
      .from(studentAttendance)
      .where(
        and(
          eq(studentAttendance.date, today),
          eq(studentAttendance.classId, classId)
        )
      );

    // Map attendance to students
    const attendanceMap = new Map(
      todayAttendance.map(record => [record.studentId, record])
    );

    const attendanceList: StudentAttendance[] = classStudents.map(student => {
      const attendanceRecord = attendanceMap.get(student.id);
      const statusFromDB = attendanceRecord?.status;
      
      // Convert database status to our type
      let status: AttendanceStatus | 'not_recorded' = 'not_recorded';
      
      if (statusFromDB && isValidAttendanceStatus(statusFromDB)) {
        status = statusFromDB;
      }

      return {
        studentId: student.id,
        studentName: student.name,
        status,
        remarks: attendanceRecord?.remarks || undefined,
        subjectId: attendanceRecord?.subjectId || undefined,
        period: attendanceRecord?.period || undefined,
      };
    });

    return {
      success: true,
      data: {
        classId,
        className: classInfo.className,
        date: today,
        attendance: attendanceList,
      },
    };
  } catch (error) {
    console.error('Error fetching today\'s class attendance:', error);
    return { success: false, error: 'Failed to fetch today\'s attendance' };
  }
}

// Get monthly attendance report
export async function getMonthlyAttendanceReport(month: number, year: number, classId?: number) {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');

    if (classId) {
      // Get class-specific report
      const [classInfo] = await db
        .select()
        .from(classes)
        .where(eq(classes.id, classId));

      if (!classInfo) {
        return { success: false, error: 'Class not found' };
      }

      // Get attendance summary for the month
      const summary = await db
        .select()
        .from(attendanceSummary)
        .where(
          and(
            eq(attendanceSummary.month, month),
            eq(attendanceSummary.year, year),
            eq(attendanceSummary.classId, classId)
          )
        );

      // Get daily attendance for the month
      const dailyAttendance = await db
        .select({
          date: studentAttendance.date,
          status: studentAttendance.status,
          studentName: sql<string>`CONCAT(${students.name}, ' ', ${students.surname})`.as('student_name'),
          className: classes.className,
        })
        .from(studentAttendance)
        .leftJoin(students, eq(studentAttendance.studentId, students.id))
        .leftJoin(classes, eq(studentAttendance.classId, classes.id))
        .where(
          and(
            between(studentAttendance.date, startDateStr, endDateStr),
            eq(studentAttendance.classId, classId)
          )
        )
        .orderBy(asc(studentAttendance.date), asc(students.name));

      return {
        success: true,
        data: {
          summary,
          dailyAttendance,
          classInfo,
        },
      };
    } else {
      // Get school-wide report
      const viewData = await db
        .select()
        .from(dailyAttendanceView)
        .where(between(dailyAttendanceView.date, startDateStr, endDateStr))
        .orderBy(asc(dailyAttendanceView.date));

      return { success: true, data: viewData };
    }
  } catch (error) {
    console.error('Error generating monthly report:', error);
    return { success: false, error: 'Failed to generate monthly report' };
  }
}

// Get attendance statistics
export async function getAttendanceStats(classId?: number, startDate?: string, endDate?: string) {
  try {
    if (classId) {
      // Class-specific stats
      const conditions = [eq(studentAttendance.classId, classId)];

      const defaultStartDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const defaultEndDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');
      
      if (startDate && endDate) {
        conditions.push(between(studentAttendance.date, startDate, endDate));
      } else {
        conditions.push(between(studentAttendance.date, defaultStartDate, defaultEndDate));
      }

      // Get stats
      const statsResult = await db
        .select({
          status: studentAttendance.status,
          count: sql<number>`count(*)`.as('count')
        })
        .from(studentAttendance)
        .where(and(...conditions))
        .groupBy(studentAttendance.status);

      // Transform to typed array
      const stats = statsResult.map(row => ({
        status: row.status,
        count: Number(row.count)
      }));

      // Get total students in class
      const [classInfo] = await db
        .select()
        .from(classes)
        .where(eq(classes.id, classId));

      const totalStudentsResult = await db
        .select({
          count: sql<number>`count(*)`.as('count')
        })
        .from(students)
        .where(eq(students.class, classInfo?.className || ''));

      const totalStudents = Number(totalStudentsResult[0]?.count) || 0;

      // Calculate totals
      const present = stats.find(s => s.status === 'present')?.count || 0;
      const absent = stats.find(s => s.status === 'absent')?.count || 0;
      const late = stats.find(s => s.status === 'late')?.count || 0;
      const halfDay = stats.find(s => s.status === 'half-day')?.count || 0;
      const total = present + absent + late + halfDay;

      const attendancePercentage = total > 0
        ? Math.round((present / total) * 100)
        : 0;

      return {
        success: true,
        data: {
          total,
          present,
          absent,
          late,
          halfDay,
          attendancePercentage,
          totalStudents,
          stats,
        },
      };
    } else {
      // School-wide stats
      const today = new Date();
      const monthStart = format(startOfMonth(today), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd');

      const viewData = await db
        .select()
        .from(dailyAttendanceView)
        .where(between(dailyAttendanceView.date, monthStart, monthEnd));

      const totalAttendance = viewData.reduce(
        (acc, day) => ({
          present: acc.present + (Number(day.presentCount) || 0),
          absent: acc.absent + (Number(day.absentCount) || 0),
          late: acc.late + (Number(day.lateCount) || 0),
          totalStudents: Number(day.totalStudents) || 0,
        }),
        { present: 0, absent: 0, late: 0, totalStudents: 0 }
      );

      const total = totalAttendance.present + totalAttendance.absent + totalAttendance.late;
      const attendancePercentage = total > 0
        ? Math.round((totalAttendance.present / total) * 100)
        : 0;

      return {
        success: true,
        data: {
          present: totalAttendance.present,
          absent: totalAttendance.absent,
          late: totalAttendance.late,
          attendancePercentage,
          totalStudents: totalAttendance.totalStudents,
          viewData,
        },
      };
    }
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    return { success: false, error: 'Failed to fetch attendance statistics' };
  }
}

// Update attendance record
export async function updateAttendance(id: number, data: Partial<NewAttendanceRecord>) {
  try {
    const [updatedAttendance] = await db
      .update(studentAttendance)
      .set(data)
      .where(eq(studentAttendance.id, id))
      .returning();

    revalidatePath('/attendance');
    return { success: true, data: updatedAttendance, message: 'Attendance updated successfully' };
  } catch (error) {
    console.error('Error updating attendance:', error);
    return { success: false, error: 'Failed to update attendance' };
  }
}

// Delete attendance record
export async function deleteAttendance(id: number) {
  try {
    await db.delete(studentAttendance).where(eq(studentAttendance.id, id));
    revalidatePath('/attendance');
    return { success: true, message: 'Attendance record deleted successfully' };
  } catch (error) {
    console.error('Error deleting attendance:', error);
    return { success: false, error: 'Failed to delete attendance record' };
  }
}

// Get students by class (for attendance marking)
export async function getStudentsByClass(classId: number) {
  try {
    // Get class name
    const [classInfo] = await db
      .select({ className: classes.className })
      .from(classes)
      .where(eq(classes.id, classId));

    if (!classInfo) {
      return { success: false, error: 'Class not found' };
    }

    // Get students in this class
    const studentsList = await db
      .select({
        id: students.id,
        name: sql<string>`CONCAT(${students.name}, ' ', ${students.surname})`.as('student_name'),
        email: students.email,
        phone: students.phone,
        className: students.class,
      })
      .from(students)
      .where(eq(students.class, classInfo.className))
      .orderBy(asc(students.name));

    return { success: true, data: studentsList };
  } catch (error) {
    console.error('Error fetching students by class:', error);
    return { success: false, error: 'Failed to fetch students' };
  }
}

// Get classes for attendance
export async function getClasses() {
  try {
    const classList = await db
      .select({
        id: classes.id,
        className: classes.className,
        classSection: classes.classSection,
        classTeacher: classes.classTeacher,
      })
      .from(classes)
      .orderBy(asc(classes.className), asc(classes.classSection));

    return { success: true, data: classList };
  } catch (error) {
    console.error('Error fetching classes:', error);
    return { success: false, error: 'Failed to fetch classes' };
  }
}

// Get attendance summary for dashboard
export async function getDashboardAttendanceStats() {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');

    // Get today's attendance summary
    const todayStats = await db
      .select()
      .from(dailyAttendanceView)
      .where(eq(dailyAttendanceView.date, today));

    // Get monthly summary
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const monthlySummary = await db
      .select()
      .from(attendanceSummary)
      .where(
        and(
          eq(attendanceSummary.month, currentMonth),
          eq(attendanceSummary.year, currentYear)
        )
      );

    return {
      success: true,
      data: {
        today: todayStats,
        monthly: monthlySummary,
      },
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { success: false, error: 'Failed to fetch dashboard statistics' };
  }
}