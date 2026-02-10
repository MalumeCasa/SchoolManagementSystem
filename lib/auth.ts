import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { getUserByEmail, getUserById } from "./db"
import { UserRole } from "./types"

const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: number, email: string, role: UserRole) {
  const cookieStore = await cookies()
  const sessionData = JSON.stringify({ userId, email, role, createdAt: Date.now() })

  cookieStore.set("session", sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")

  if (!session) return null

  try {
    return JSON.parse(session.value) as {
      userId: number
      email: string
      role: UserRole
      createdAt: number
    }
  } catch {
    return null
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    return null
  }

  const user = await getUserById(session.userId)
  if (!user) {
    await destroySession()
    return null
  }

  return {
    id: user.id,
    email: user.email,
    fullName: `${user.full_name}`,
    role: user.role,
    studentId: user.student_id,
    teacherId: user.teacher_id,
    phone: user.phone,
    status: user.status,
  }
}

// Alias for getCurrentUser - used by many components
export async function getCurrentUser() {
  return requireAuth()
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth()
  if (!user || !allowedRoles.includes(user.role)) {
    return null
  }
  return user
}

export async function requireAdmin() {
  return requireRole(["admin"])
}

export async function requireTeacher() {
  return requireRole(["admin", "teacher"])
}

export async function requireStudent() {
  return requireRole(["admin", "teacher", "student"])
}

export function getRoleDashboardPath(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/dashboard/admin"
    case "teacher":
      return "/dashboard/teacher"
    case "student":
      return "/dashboard/student"
    default:
      return "/dashboard"
  }
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case "admin":
      return "Administrator"
    case "teacher":
      return "Teacher"
    case "student":
      return "Student"
    default:
      return "User"
  }
}
