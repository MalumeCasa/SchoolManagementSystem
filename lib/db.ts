import { neon } from "@neondatabase/serverless"

export const sql = neon(process.env.DATABASE_URL!)

import {
    UserRole,
    User, 
    Class,
    Subject,
    Attendance,
    Grade,
    Announcement,
    Schedule
} from "./types"

// User functions
export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1` as User[]
  return users[0] || null
}

export async function getUserById(id: number): Promise<User | null> {
  const users = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1` as User[]
  return users[0] || null
}

export async function createUser(
  email: string,
  passwordHash: string,
  fullName: string,
  role: UserRole = "student",
  additionalData?: Partial<User>
) {
  const users = await sql`
    INSERT INTO users (
      email, password_hash, full_name, role,
      student_id, teacher_id, phone, address, date_of_birth, gender,
      id_number, guardian_name, guardian_phone, guardian_email, status
    ) VALUES (
      ${email}, ${passwordHash}, ${fullName}, ${role},
      ${additionalData?.student_id || null},
      ${additionalData?.teacher_id || null},
      ${additionalData?.phone || null},
      ${additionalData?.address || null},
      ${additionalData?.date_of_birth || null},
      ${additionalData?.gender || null},
      ${additionalData?.id_number || null},
      ${additionalData?.guardian_name || null},
      ${additionalData?.guardian_phone || null},
      ${additionalData?.guardian_email || null},
      'active'
    )
    RETURNING *
  `
  return users[0]
}

export async function updateUser(id: number, data: Partial<User>) {
  const users = await sql`
    UPDATE users SET
      lastname = COALESCE(${data.lastname || null}, lastname),
      firstname = COALESCE(${data.firstname || null}, firstname),
      phone = COALESCE(${data.phone || null}, phone),
      address = COALESCE(${data.address || null}, address),
      date_of_birth = COALESCE(${data.date_of_birth || null}, date_of_birth),
      gender = COALESCE(${data.gender || null}, gender),
      guardian_name = COALESCE(${data.guardian_name || null}, guardian_name),
      guardian_phone = COALESCE(${data.guardian_phone || null}, guardian_phone),
      guardian_email = COALESCE(${data.guardian_email || null}, guardian_email),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `
  return users[0]
}

export async function getAllUsers(role?: UserRole): Promise<User[]> {
  if (role) {
    return await sql`
      SELECT id, email, full_name, role, student_id, teacher_id, phone, status, created_at 
      FROM users WHERE role = ${role} ORDER BY created_at DESC
    ` as User[]
  }
  return await sql`
    SELECT id, email, full_name, role, student_id, teacher_id, phone, status, created_at 
    FROM users ORDER BY created_at DESC
  ` as User[]
}

export async function updateUserRole(userId: number, newRole: UserRole) {
  const users = await sql`
    UPDATE users SET role = ${newRole}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${userId}
    RETURNING *
  `
  return users[0]
}

export async function getStudentCount(): Promise<number> {
  const result = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'student'`
  return Number(result[0].count)
}

export async function getTeacherCount(): Promise<number> {
  const result = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'teacher'`
  return Number(result[0].count)
}

// Class functions
export async function getAllClasses(): Promise<Class[]> {
  return await sql`
    SELECT c.*, u.full_name as teacher_name,
    (SELECT COUNT(*) FROM class_enrollments ce WHERE ce.class_id = c.id AND ce.status = 'active') as student_count
    FROM classes c
    LEFT JOIN users u ON c.teacher_id = u.id
    ORDER BY c.grade_level, c.name
  ` as Class[]
}

export async function getClassById(id: number): Promise<Class | null> {
  const classes = await sql`
    SELECT c.*, u.full_name as teacher_name
    FROM classes c
    LEFT JOIN users u ON c.teacher_id = u.id
    WHERE c.id = ${id}
  ` as Class[]
  return classes[0] || null
}

export async function createClass(data: Partial<Class>) {
  const classes = await sql`
    INSERT INTO classes (name, grade_level, section, academic_year, teacher_id, room_number, capacity)
    VALUES (${data.name}, ${data.grade_level}, ${data.section || null}, ${data.academic_year}, 
            ${data.teacher_id || null}, ${data.room_number || null}, ${data.capacity || 30})
    RETURNING *
  ` as Class[]
  return classes[0]
}

export async function getClassesByTeacher(teacherId: number): Promise<Class[]> {
  return await sql`
    SELECT c.*, 
    (SELECT COUNT(*) FROM class_enrollments ce WHERE ce.class_id = c.id AND ce.status = 'active') as student_count
    FROM classes c
    WHERE c.teacher_id = ${teacherId}
    ORDER BY c.grade_level, c.name
  ` as Class[]
}

export async function getClassesByStudent(studentId: number): Promise<Class[]> {
  return await sql`
    SELECT c.*, u.full_name as teacher_name
    FROM classes c
    JOIN class_enrollments ce ON c.id = ce.class_id
    LEFT JOIN users u ON c.teacher_id = u.id
    WHERE ce.student_id = ${studentId} AND ce.status = 'active'
    ORDER BY c.grade_level, c.name
  ` as Class[]
}

export async function enrollStudent(studentId: number, classId: number) {
  return await sql`
    INSERT INTO class_enrollments (student_id, class_id, status)
    VALUES (${studentId}, ${classId}, 'active')
    ON CONFLICT (student_id, class_id) DO UPDATE SET status = 'active'
    RETURNING *
  ` 
}

export async function getStudentsInClass(classId: number): Promise<User[]> {
  return await sql`
    SELECT u.id, u.email, u.full_name, u.student_id, u.phone, u.status
    FROM users u
    JOIN class_enrollments ce ON u.id = ce.student_id
    WHERE ce.class_id = ${classId} AND ce.status = 'active'
    ORDER BY u.full_name
  ` as User[]
}

// Subject functions
export async function getAllSubjects(): Promise<Subject[]> {
  return await sql`SELECT * FROM subjects ORDER BY name` as Subject[]
}

export async function getSubjectById(id: number): Promise<Subject | null> {
  const subjects = await sql`SELECT * FROM subjects WHERE id = ${id}` as Subject[]
  return subjects[0] || null 
}

// Attendance functions
export async function markAttendance(
  studentId: number,
  classId: number,
  status: "present" | "absent" | "late" | "excused",
  markedBy: number,
  date?: string,
  notes?: string
) {
  const attendanceDate = date || new Date().toISOString().split("T")[0]
  return await sql`
    INSERT INTO attendance (student_id, class_id, date, status, marked_by, notes)
    VALUES (${studentId}, ${classId}, ${attendanceDate}, ${status}, ${markedBy}, ${notes || null})
    ON CONFLICT (student_id, class_id, date) 
    DO UPDATE SET status = ${status}, marked_by = ${markedBy}, notes = ${notes || null}
    RETURNING *
  `
}

export async function getAttendanceByClass(classId: number, date?: string): Promise<Attendance[]> {
  const attendanceDate = date || new Date().toISOString().split("T")[0]
  return await sql`
    SELECT a.*, u.full_name as student_name
    FROM attendance a
    JOIN users u ON a.student_id = u.id
    WHERE a.class_id = ${classId} AND a.date = ${attendanceDate}
    ORDER BY u.full_name
  ` as Attendance[]
}

export async function getAttendanceByStudent(studentId: number, startDate?: string, endDate?: string): Promise<Attendance[]> {
  if (startDate && endDate) {
    return await sql`
      SELECT a.*, c.name as class_name
      FROM attendance a
      JOIN classes c ON a.class_id = c.id
      WHERE a.student_id = ${studentId} AND a.date BETWEEN ${startDate} AND ${endDate}
      ORDER BY a.date DESC
    ` as Attendance[]
  }
  return await sql`
    SELECT a.*, c.name as class_name
    FROM attendance a
    JOIN classes c ON a.class_id = c.id
    WHERE a.student_id = ${studentId}
    ORDER BY a.date DESC
    LIMIT 30
  ` as Attendance[]
}

export async function getAttendanceStats(studentId: number): Promise<{ present: number; absent: number; late: number; excused: number }> {
  const stats = await sql`
    SELECT 
      COUNT(*) FILTER (WHERE status = 'present') as present,
      COUNT(*) FILTER (WHERE status = 'absent') as absent,
      COUNT(*) FILTER (WHERE status = 'late') as late,
      COUNT(*) FILTER (WHERE status = 'excused') as excused
    FROM attendance
    WHERE student_id = ${studentId}
  `
  return {
    present: Number(stats[0].present) || 0,
    absent: Number(stats[0].absent) || 0,
    late: Number(stats[0].late) || 0,
    excused: Number(stats[0].excused) || 0,
  }
}

// Grade functions
export async function addGrade(data: {
  studentId: number
  subjectId: number
  classId: number
  gradeType: string
  title: string
  score: number
  maxScore?: number
  weight?: number
  gradedBy: number
  comments?: string
}) {
  return await sql`
    INSERT INTO grades (student_id, subject_id, class_id, grade_type, title, score, max_score, weight, graded_by, comments)
    VALUES (${data.studentId}, ${data.subjectId}, ${data.classId}, ${data.gradeType}, ${data.title}, 
            ${data.score}, ${data.maxScore || 100}, ${data.weight || 1}, ${data.gradedBy}, ${data.comments || null})
    RETURNING *
  `
}

export async function getGradesByStudent(studentId: number): Promise<Grade[]> {
  return await sql`
    SELECT g.*, s.name as subject_name
    FROM grades g
    JOIN subjects s ON g.subject_id = s.id
    WHERE g.student_id = ${studentId}
    ORDER BY g.graded_at DESC
  ` as Grade[]
}

export async function getGradesByClass(classId: number, subjectId?: number): Promise<Grade[]> {
  if (subjectId) {
    return await sql`
      SELECT g.*, u.full_name as student_name, s.name as subject_name
      FROM grades g
      JOIN users u ON g.student_id = u.id
      JOIN subjects s ON g.subject_id = s.id
      WHERE g.class_id = ${classId} AND g.subject_id = ${subjectId}
      ORDER BY u.full_name, g.graded_at DESC
    ` as Grade[]
  }
  return await sql`
    SELECT g.*, u.full_name as student_name, s.name as subject_name
    FROM grades g
    JOIN users u ON g.student_id = u.id
    JOIN subjects s ON g.subject_id = s.id
    WHERE g.class_id = ${classId}
    ORDER BY u.full_name, g.graded_at DESC
  ` as Grade[]
}

// Announcement functions
export async function createAnnouncement(data: {
  title: string
  content: string
  authorId: number
  targetAudience?: string
  priority?: string
  isPinned?: boolean
  expiresAt?: string
}) {
  return await sql`
    INSERT INTO announcements (title, content, author_id, target_audience, priority, is_pinned, expires_at)
    VALUES (${data.title}, ${data.content}, ${data.authorId}, ${data.targetAudience || "all"}, 
            ${data.priority || "normal"}, ${data.isPinned || false}, ${data.expiresAt || null})
    RETURNING *
  `
}

export async function getAnnouncements(targetAudience?: string): Promise<Announcement[]> {
  if (targetAudience && targetAudience !== "all") {
    return await sql`
      SELECT a.*, u.full_name as author_name
      FROM announcements a
      JOIN users u ON a.author_id = u.id
      WHERE (a.target_audience = ${targetAudience} OR a.target_audience = 'all')
        AND (a.expires_at IS NULL OR a.expires_at > CURRENT_TIMESTAMP)
      ORDER BY a.is_pinned DESC, a.created_at DESC
      LIMIT 50
    ` as Announcement[]
  }
  return await sql`
    SELECT a.*, u.full_name as author_name
    FROM announcements a
    JOIN users u ON a.author_id = u.id
    WHERE a.expires_at IS NULL OR a.expires_at > CURRENT_TIMESTAMP
    ORDER BY a.is_pinned DESC, a.created_at DESC
    LIMIT 50
  ` as Announcement[]
}

// Schedule functions
export async function getScheduleByClass(classId: number): Promise<Schedule[]> {
  return await sql`
    SELECT s.*, sub.name as subject_name, u.full_name as teacher_name, c.name as class_name
    FROM schedules s
    JOIN subjects sub ON s.subject_id = sub.id
    JOIN classes c ON s.class_id = c.id
    LEFT JOIN users u ON s.teacher_id = u.id
    WHERE s.class_id = ${classId}
    ORDER BY s.day_of_week, s.start_time
  ` as Schedule[]
}

export async function getScheduleByTeacher(teacherId: number): Promise<Schedule[]> {
  return await sql`
    SELECT s.*, sub.name as subject_name, c.name as class_name
    FROM schedules s
    JOIN subjects sub ON s.subject_id = sub.id
    JOIN classes c ON s.class_id = c.id
    WHERE s.teacher_id = ${teacherId}
    ORDER BY s.day_of_week, s.start_time
  ` as Schedule[]
}

export async function createSchedule(data: {
  classId: number
  subjectId: number
  teacherId?: number
  dayOfWeek: number
  startTime: string
  endTime: string
  room?: string
}) {
  return await sql`
    INSERT INTO schedules (class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room)
    VALUES (${data.classId}, ${data.subjectId}, ${data.teacherId || null}, ${data.dayOfWeek}, 
            ${data.startTime}, ${data.endTime}, ${data.room || null})
    RETURNING *
  `
}

// Admin helper functions
export async function updateUserStatus(userId: number, isActive: boolean) {
  const status = isActive ? "active" : "inactive";
  const users = await sql`
    UPDATE users SET status = ${status}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${userId}
    RETURNING *
  `;
  return users[0];
}

export async function getTeachers(): Promise<User[]> {
  return await sql`
    SELECT id, email, full_name as first_name, '' as last_name, role, phone, status, created_at 
    FROM users WHERE role = 'teacher' AND status = 'active' 
    ORDER BY full_name
  ` as User[]
  ;
}

// Dashboard stats
export async function getDashboardStats() {
  const [students, teachers, classes, attendance] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM users WHERE role = 'student' AND status = 'active'`,
    sql`SELECT COUNT(*) as count FROM users WHERE role = 'teacher' AND status = 'active'`,
    sql`SELECT COUNT(*) as count FROM classes`,
    sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'present') as present,
        COUNT(*) as total
      FROM attendance 
      WHERE date = CURRENT_DATE
    `,
  ])

  return {
    totalStudents: Number(students[0].count) || 0,
    totalTeachers: Number(teachers[0].count) || 0,
    totalClasses: Number(classes[0].count) || 0,
    todayAttendance: {
      present: Number(attendance[0].present) || 0,
      total: Number(attendance[0].total) || 0,
    },
  }
}
