import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getStudents } from "@api/student-actions";
import { DisplayStudentsPage } from "@/components/Management/Students/displayStudents";
import { StudentsPageSkeleton } from "@/components/Management/Students/students-skeleton";
import { Button } from "@/components/ui/button";
import { UserPlus, Users, GraduationCap, BookOpen } from "lucide-react";
import type { StudentFromDB, DisplayStudent } from "@/types/student";

export const metadata: Metadata = {
  title: "Student Directory | School Management System",
  description: "Manage and view all students in the system",
};

interface UserProps {
  user: {
    id: number;
    fullName: string;
    role: string;
  };
}

// Helper function to convert DB student to frontend DisplayStudent type
function convertDBStudentToDisplayStudent(dbStudent: StudentFromDB): DisplayStudent {
  // Extract year from class name or use a default
  const year = dbStudent.className ? parseInt(dbStudent.className.match(/\d+/)?.[0] || "0") || null : null;
  
  return {
    id: dbStudent.id.toString(),
    studentId: dbStudent.studentId,
    name: dbStudent.name,
    surname: dbStudent.surname,
    email: dbStudent.email,
    phone: dbStudent.phone,
    address: dbStudent.address,
    year: year,
    class: dbStudent.class || dbStudent.className,
    className: dbStudent.className,
    status: dbStudent.status,
    registeredStudentId: dbStudent.registeredStudentId,
    classId: dbStudent.classId,
    attendance: dbStudent.attendance,
    dateOfBirth: dbStudent.dateOfBirth,
    gender: dbStudent.gender,
    enrollmentDate: dbStudent.enrollmentDate,
    idNumber: dbStudent.idNumber,
    classSection: dbStudent.classSection,
    createdAt: dbStudent.createdAt,
    updatedAt: dbStudent.updatedAt,
  };
}

export default async function StudentDirectoryPage({ user }: UserProps) {
  const dbStudents = await getStudents() as StudentFromDB[];
  
  // Convert DB students to frontend DisplayStudent type
  const students = dbStudents.map(convertDBStudentToDisplayStudent);

  // Calculate stats
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status?.toLowerCase() === 'active').length;
  const uniqueClasses = [...new Set(students.map(s => s.class).filter(Boolean))].length;
  const graduatedStudents = students.filter(s => s.status?.toLowerCase() === 'graduated').length;

  const stats = [
    { 
      label: "Total Students", 
      value: totalStudents, 
      icon: Users, 
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
      textColor: "text-blue-600 dark:text-blue-400"
    },
    { 
      label: "Active Students", 
      value: activeStudents, 
      icon: GraduationCap, 
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
      textColor: "text-emerald-600 dark:text-emerald-400"
    },
    { 
      label: "Classes", 
      value: uniqueClasses, 
      icon: BookOpen, 
      color: "from-violet-500 to-violet-600",
      bgColor: "bg-violet-50 dark:bg-violet-950/50",
      textColor: "text-violet-600 dark:text-violet-400"
    },
    { 
      label: "Graduated", 
      value: graduatedStudents, 
      icon: GraduationCap, 
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/50",
      textColor: "text-amber-600 dark:text-amber-400"
    },
  ];

  return (
    <div className="mx-auto max-w-screen-2xl space-y-6 p-4 md:p-6 2xl:p-10">
      {/* Header Section */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Breadcrumb pageName="Student Directory" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Student Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View, filter, and manage all student records in one place
          </p>
        </div>
        
        <Link href="/register/new/student/">
          <Button 
            size="lg" 
            className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            <UserPlus className="h-5 w-5" />
            Register New Student
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 opacity-20 blur-2xl transition-all group-hover:scale-150 dark:from-gray-700 dark:to-gray-600" />
              
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`rounded-xl ${stat.bgColor} p-3`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-1 text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    Updated just now
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
        <Suspense fallback={<StudentsPageSkeleton />}>
          <DisplayStudentsPage students={students} />
        </Suspense>
      </div>
    </div>
  );
}