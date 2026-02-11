// app/db/staff-type.ts
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { staff } from '@lib/db/schema';

// Define permissions interface
export interface StaffPermissions {
  // Dashboard permissions
  canViewDashboard?: boolean;
  
  // Student permissions
  canViewStudents?: boolean;
  canManageStudents?: boolean;
  canViewStudentDetails?: boolean;
  
  // Staff permissions
  canViewStaff?: boolean;
  canManageStaff?: boolean;
  
  // Class permissions
  canViewClasses?: boolean;
  canManageClasses?: boolean;
  
  // Subject permissions
  canViewSubjects?: boolean;
  canManageSubjects?: boolean;
  
  // Attendance permissions
  canViewAttendance?: boolean;
  canManageAttendance?: boolean;
  canExportAttendance?: boolean;
  
  // Exam permissions
  canViewExams?: boolean;
  canManageExams?: boolean;
  canViewExamResults?: boolean;
  canManageExamResults?: boolean;
  
  // Fee permissions
  canViewFees?: boolean;
  canManageFees?: boolean;
  canProcessPayments?: boolean;
  canViewFeeReports?: boolean;
  
  // Report permissions
  canViewReports?: boolean;
  canGenerateReports?: boolean;
  canExportReports?: boolean;
  
  // Settings permissions
  canViewSettings?: boolean;
  canManageSettings?: boolean;
  
  // Allow dynamic permissions
  [key: string]: boolean | undefined;
}

// Original Drizzle type (with number id)
export type DbStaff = Omit<InferSelectModel<typeof staff>, 'permissions'> & {
  permissions?: StaffPermissions;
};

// Frontend type (with string id)
export type Staff = Omit<DbStaff, 'id'> & { 
  id: string | number;
  permissions?: StaffPermissions;
};

export type InsertStaff = Omit<InferInsertModel<typeof staff>, 'permissions'> & {
  permissions?: StaffPermissions;
};

export type StaffRole = 
  | 'principal' 
  | 'vice principal' 
  | 'head of department' 
  | 'teacher' 
  | 'administrator' 
  | 'support staff' 
  | 'accountant' 
  | 'librarian' 
  | string;

export type EmploymentType = 
  | 'full-time' 
  | 'part-time' 
  | 'contract' 
  | 'temporary' 
  | string;

export type Department = 
  | 'administration' 
  | 'academic' 
  | 'support' 
  | 'finance' 
  | 'library' 
  | string;

// Default permissions for each role
export const DEFAULT_PERMISSIONS: Record<string, StaffPermissions> = {
  'principal': {
    canViewDashboard: true,
    canViewStudents: true,
    canManageStudents: true,
    canViewStaff: true,
    canManageStaff: true,
    canViewClasses: true,
    canManageClasses: true,
    canViewSubjects: true,
    canManageSubjects: true,
    canViewAttendance: true,
    canManageAttendance: true,
    canViewExams: true,
    canManageExams: true,
    canViewFees: true,
    canManageFees: true,
    canViewReports: true,
    canGenerateReports: true,
    canViewSettings: true,
    canManageSettings: true,
  },
  'vice principal': {
    canViewDashboard: true,
    canViewStudents: true,
    canManageStudents: true,
    canViewStaff: true,
    canViewClasses: true,
    canManageClasses: true,
    canViewSubjects: true,
    canViewAttendance: true,
    canManageAttendance: true,
    canViewExams: true,
    canManageExams: true,
    canViewFees: true,
    canViewReports: true,
    canGenerateReports: true,
    canViewSettings: true,
  },
  'head of department': {
    canViewDashboard: true,
    canViewStudents: true,
    canManageStudents: true,
    canViewStaff: true,
    canViewClasses: true,
    canManageClasses: true,
    canViewSubjects: true,
    canManageSubjects: true,
    canViewAttendance: true,
    canManageAttendance: true,
    canViewExams: true,
    canManageExams: true,
    canViewReports: true,
  },
  'teacher': {
    canViewDashboard: true,
    canViewStudents: true,
    canViewStudentDetails: true,
    canViewClasses: true,
    canViewSubjects: true,
    canViewAttendance: true,
    canManageAttendance: true,
    canViewExams: true,
    canManageExams: true,
    canViewExamResults: true,
    canManageExamResults: true,
  },
  'administrator': {
    canViewDashboard: true,
    canViewStudents: true,
    canManageStudents: true,
    canViewStaff: true,
    canManageStaff: true,
    canViewClasses: true,
    canManageClasses: true,
    canViewAttendance: true,
    canManageAttendance: true,
    canViewFees: true,
    canManageFees: true,
    canViewReports: true,
    canGenerateReports: true,
  },
  'support staff': {
    canViewDashboard: true,
    canViewStudents: true,
    canViewClasses: true,
    canViewAttendance: true,
  },
  'accountant': {
    canViewDashboard: true,
    canViewStudents: true,
    canViewFees: true,
    canManageFees: true,
    canProcessPayments: true,
    canViewFeeReports: true,
    canGenerateReports: true,
  },
  'librarian': {
    canViewDashboard: true,
    canViewStudents: true,
    canViewClasses: true,
  },
};

// Helper function to get default permissions for a role
export function getDefaultPermissions(role: StaffRole): StaffPermissions {
  const normalizedRole = role.toLowerCase();
  return DEFAULT_PERMISSIONS[normalizedRole] || DEFAULT_PERMISSIONS['teacher'];
}

// Helper function to check permissions
export function checkPermission(
  permissions: StaffPermissions | undefined, 
  permissionKey: keyof StaffPermissions | string
): boolean {
  if (!permissions) return false;
  return permissions[permissionKey] === true;
}