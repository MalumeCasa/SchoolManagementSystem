import { students, registeredStudents } from "@lib/db/schema";

export type Student = typeof students.$inferSelect;
export type RegisteredStudent = typeof registeredStudents.$inferSelect;

// For the frontend display
export interface DisplayStudent {
  id: string;
  studentId: string | null;
  name: string;
  surname: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  year?: number | null;
  class: string | null;
  className: string | null;
  status: string | null;
  registeredStudentId: number | null;
  classId: number | null;
  attendance: string | null;
  dateOfBirth: Date | string | null;
  gender: string | null;
  enrollmentDate: Date | string | null;
  idNumber: string | null;
  classSection: string | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
}

// Type for the API response from getStudents
export type StudentFromDB = {
  id: number;
  registeredStudentId: number | null;
  studentId: string | null;
  name: string;
  surname: string;
  phone: string | null;
  address: string | null;
  attendance: string | null;
  classId: number | null;
  email: string | null;
  dateOfBirth: Date | string | null;
  gender: string | null;
  enrollmentDate: Date | string | null;
  status: string | null;
  idNumber: string | null;
  className: string | null;
  classSection: string | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
  class: string | null;
};