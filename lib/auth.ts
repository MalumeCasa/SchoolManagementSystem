'use server'

import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
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

// Pure function to get current user without side effects
export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null

  const user = await getUserById(session.userId)
  if (!user) return null // Don't delete the cookie here, just return null

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

// For protected pages - redirects if not authenticated
export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/login")
  }
  
  return user
}

// For role-based protection - redirects if not authorized
export async function requireRole(allowedRoles: UserRole[]) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/login")
  }
  
  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized")
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

// Server Action to clean up invalid sessions (call this from client components when needed)
export async function cleanupInvalidSession() {
  'use server'
  
  const session = await getSession()
  if (session) {
    const user = await getUserById(session.userId)
    if (!user) {
      await destroySession()
    }
  }
}

// Utility functions (these don't need to be async, but since file has 'use server', they must be)
export async function getRoleDashboardPath(role: UserRole): Promise<string> {
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

export async function getRoleLabel(role: UserRole): Promise<string> {
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