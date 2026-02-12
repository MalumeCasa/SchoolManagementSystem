// types/user.ts
export type UserRole = "admin" | "teacher" | "student";

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  studentId?: string;
  teacherId?: string;
  phone?: string;
  status?: string;
}

export interface LayoutUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
}