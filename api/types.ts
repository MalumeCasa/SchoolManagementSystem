// types.ts - Complete type definitions for the application

// ===== DATABASE TYPES =====
// These match your database schema

export type Student = {
  id: number | string;
  name: string;
  surname: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  attendance?: string | null | number;
  class?: string | null;
};

export type Teacher = {
  id: number | string;
  name: string | null;
  surname: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  subjects: string[] | null;
  experience: number | null;
  qualification: string | null;
  staffId: number | null;
  classRole?: string | null;
  // Add missing properties
  classes?: Class[];
  classIds?: number[];
};

export type Subject = {
  id: number | string;
  name: string | null;
  teacher: string | null;
  schedule: string | null;
  duration: string | null;
  topics: string[] | null;
  assessments: Array<{ type: string; date: string }> | null;
  className: string | null;
  classSection: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
  // Add missing properties
  classId?: number | null;
  teacherIds: number[] | null;
  teacherNames: string[] | null;
};

export type Class = {
  id: number | string;
  className: string | null;
  classSection: string | null;
  teachers: string[] | null;
  subjects: string[] | null;
  classTeacher?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

export type ClassActivity = {
  id: number | string;
  title: string;
  date: string;
  className?: string | null;
};

// ===== UI STATE TYPES =====
// For component state management

export type LoadingState = {
  isLoading: boolean;
  error: string | null;
};

export type SelectionState = {
  selectedItems: string[] | number[];
  allSelected: boolean;
};

export type FormState = {
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
  errors: Record<string, string>;
};

// ===== FILTER TYPES =====
// For data filtering

export type ClassFilter = {
  section?: string;
  teacher?: string;
  subject?: string;
};

export type StudentFilter = {
  class?: string;
  attendance?: string;
  searchQuery?: string;
};

export type TeacherFilter = {
  subject?: string;
  role?: string;
  searchQuery?: string;
};

export interface ClassData {
  students: number;
  subjects: number;
  teacher: string;
  activities: ClassActivity[];
}

export interface ClassSection {
  name: string;
  classes: string[];
}

export type ActiveView = "overview" | "students" | "teachers" | "subjects";

export interface EditingClass {
  section: string;
  index: number;
}

// Add Chapter type for curriculum
export interface Chapter {
  id: string;
  title: string;
  topics: string[];
  duration: string;
  objectives: string[];
}