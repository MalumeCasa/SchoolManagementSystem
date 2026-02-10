
export type UserRole = "admin" | "teacher" | "student"

export type User = {
  full_name: string
  id: number
  email: string
  password_hash?: string
  role: UserRole
  student_id?: string
  teacher_id?: string
  phone?: string
  address?: string
  date_of_birth?: string
  gender?: string
  profile_image_url?: string
  id_document_url?: string
  id_number?: string
  guardian_name?: string
  guardian_phone?: string
  guardian_email?: string
  enrollment_date?: string
  status: string
  created_at: string
  updated_at?: string
}

export type Class = {
  id: number
  name: string
  grade_level: string
  section?: string
  academic_year: string
  teacher_id?: number
  teacher_name?: string
  room_number?: string
  capacity: number
  student_count?: number
  created_at: string
}

export type Subject = {
  id: number
  name: string
  code: string
  description?: string
  credit_hours: number
  created_at: string
}

export type Attendance = {
  id: number
  student_id: number
  student_name?: string
  class_id: number
  class_name?: string
  date: string
  status: "present" | "absent" | "late" | "excused"
  marked_by?: number
  notes?: string
  created_at: string
}

export type Grade = {
  id: number
  student_id: number
  student_name?: string
  subject_id: number
  subject_name?: string
  class_id: number
  grade_type: string
  title: string
  score: number
  max_score: number
  weight: number
  graded_by?: number
  graded_at: string
  comments?: string
}

export type Announcement = {
  id: number
  title: string
  content: string
  author_id: number
  author_name?: string
  target_audience: string
  priority: string
  is_pinned: boolean
  expires_at?: string
  created_at: string
}

export type Schedule = {
  id: number
  class_id: number
  class_name?: string
  subject_id: number
  subject_name?: string
  teacher_id?: number
  teacher_name?: string
  day_of_week: number
  start_time: string
  end_time: string
  room?: string
}