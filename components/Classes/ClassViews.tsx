// use client"

import React from 'react';
import {
  Users,
  BookOpen,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Award,
  Clock,
  Calendar,
} from "lucide-react";
import { Student, Teacher, Subject, ClassData, ActiveView } from '@/app/api/types';

interface ClassViewsProps {
  activeView: ActiveView;
  selectedClass: string;
  classDataState: Record<string, ClassData>;
  studentsDataState: Record<string, Student[]>;
  teachersDataState: Record<string, Teacher[]>;
  subjectsDataState: Record<string, Subject[]>;
  loading: boolean;
  onRefreshStudentsData: () => void;
}

const ClassViews: React.FC<ClassViewsProps> = ({
  activeView,
  selectedClass,
  classDataState,
  studentsDataState,
  teachersDataState,
  subjectsDataState,
  loading,
  onRefreshStudentsData,
}) => {
  // Helper function to safely calculate attendance percentage
  const getAttendancePercentage = (student: Student): number => {
    if (!student.attendance) return 0;
    
    // If attendance is already a number, return it
    if (typeof student.attendance === 'number') {
      return student.attendance;
    }
    
    // If attendance is a string, try to parse it
    const attendanceNum = parseFloat(student.attendance.toString());
    return isNaN(attendanceNum) ? 0 : attendanceNum;
  };

  // Helper function to get attendance color class
  const getAttendanceColor = (attendance: number): string => {
    if (attendance >= 90) return "text-green-500";
    if (attendance >= 75) return "text-yellow-500";
    return "text-red-500";
  };

  const renderOverview = () => (
    <>
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="p-4 md:p-6 border border-border rounded-lg bg-background hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground text-sm md:text-base">Students</h3>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">
            {classDataState[selectedClass]?.students || 0}
          </p>
          <p className="text-xs md:text-sm text-muted-foreground">Total enrolled</p>
        </div>

        <div className="p-4 md:p-6 border border-border rounded-lg bg-background hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="font-semibold text-foreground text-sm md:text-base">Subjects</h3>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">
            {classDataState[selectedClass]?.subjects || 0}
          </p>
          <p className="text-xs md:text-sm text-muted-foreground">Active subjects</p>
        </div>

        <div className="p-4 md:p-6 border border-border rounded-lg bg-background hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <GraduationCap className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="font-semibold text-foreground text-sm md:text-base">Class Teacher</h3>
          </div>
          <p className="text-base md:text-lg font-semibold text-foreground mb-1 line-clamp-1">
            {classDataState[selectedClass]?.teacher || "N/A"}
          </p>
          <p className="text-xs md:text-sm text-muted-foreground">Form teacher</p>
        </div>
      </div>

      <div className="mt-6 md:mt-8">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Activity</h3>
        <div className="space-y-3">
          {classDataState[selectedClass]?.activities && classDataState[selectedClass].activities.length > 0 ? (
            classDataState[selectedClass].activities.map((activity, i) => (
              <div key={i} className="p-4 border border-border rounded-lg bg-background">
                <p className="font-medium text-foreground text-sm md:text-base">{activity.title}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">{activity.date}</p>
              </div>
            ))
          ) : (
            <div className="p-4 border border-border rounded-lg bg-background text-center">
              <p className="text-muted-foreground text-sm md:text-base">No recent activities</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderStudents = () => (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-xl font-semibold text-foreground">Student List</h3>
        <div className="flex items-center justify-between sm:justify-normal gap-4">
          <p className="text-sm text-muted-foreground whitespace-nowrap">
            {studentsDataState[selectedClass]?.length || 0} students
          </p>
          <button
            onClick={onRefreshStudentsData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Refreshing...
              </>
            ) : (
              "Refresh"
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      ) : studentsDataState[selectedClass] && studentsDataState[selectedClass].length > 0 ? (
        <div className="space-y-4">
          {studentsDataState[selectedClass].map((student) => {
            const attendance = getAttendancePercentage(student);
            const attendanceColor = getAttendanceColor(attendance);
            
            return (
              <div
                key={student.id}
                className="p-4 md:p-5 border border-border rounded-lg bg-background hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-foreground line-clamp-1">{student.name}</h4>
                    <p className="text-sm text-muted-foreground">ID: {student.id}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-medium text-foreground">Attendance</p>
                    <p className={`text-2xl font-bold ${attendanceColor}`}>
                      {attendance}%
                    </p>
                  </div>
                </div>

                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{student.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{student.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{student.address}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 md:py-12 border border-dashed border-border rounded-lg">
          <Users className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground px-4">No student data available for {selectedClass}</p>
          <div className="mt-4 space-y-2 px-4">
            <p className="text-sm text-muted-foreground">
              Available classes: {Object.keys(studentsDataState).join(', ') || 'None'}
            </p>
            <button
              onClick={onRefreshStudentsData}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors w-full sm:w-auto"
            >
              Refresh Data
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderTeachers = () => (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-xl font-semibold text-foreground">Teaching Staff</h3>
        <p className="text-sm text-muted-foreground">
          {teachersDataState[selectedClass]?.length || 0} teachers assigned
        </p>
      </div>

      {teachersDataState[selectedClass] && teachersDataState[selectedClass].length > 0 ? (
        <div className="space-y-4">
          {teachersDataState[selectedClass].map((teacher) => (
            <div
              key={teacher.id}
              className="p-4 md:p-6 border border-border rounded-lg bg-background hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg md:text-xl text-foreground line-clamp-1">{teacher.name}</h4>
                  <p className="text-sm text-primary font-medium mt-1">{teacher.role}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full w-fit">
                  <Award className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-500">{teacher.experience} years</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-foreground mb-2">Qualification</p>
                <p className="text-sm text-muted-foreground">{teacher.qualification}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-foreground mb-2">Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {/* FIX 1: Add optional chaining '?' before .map() */}
                  {teacher.subjects?.map((subject, idx) => ( 
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs font-medium rounded-full"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-2 text-sm pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{teacher.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{teacher.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 md:py-12 border border-dashed border-border rounded-lg">
          <GraduationCap className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground px-4">No teacher data available for this class</p>
        </div>
      )}
    </div>
  );

  const renderSubjects = () => (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-xl font-semibold text-foreground">Subject Curriculum</h3>
        <p className="text-sm text-muted-foreground">
          {subjectsDataState[selectedClass]?.length || 0} subjects
        </p>
      </div>

      {subjectsDataState[selectedClass] && subjectsDataState[selectedClass].length > 0 ? (
        <div className="space-y-4 md:space-y-6">
          {subjectsDataState[selectedClass].map((subject) => (
            <div
              key={subject.id}
              className="p-4 md:p-6 border border-border rounded-lg bg-background hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg md:text-xl text-foreground mb-1">{subject.name}</h4>
                  <p className="text-sm text-muted-foreground">Taught by {subject.teacher}</p>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-lg w-fit">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground truncate">{subject.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground truncate">{subject.duration}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-foreground mb-2">Topics Covered</p>
                <div className="flex flex-wrap gap-2">
                  {/* FIX 2: Add optional chaining '?' before .map() */}
                  {subject.topics?.map((topic, idx) => ( 
                    <span
                      key={idx}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-3">Assessments</p>
                <div className="space-y-2">
                  {/* FIX 3: Add optional chaining '?' before .map() */}
                  {subject.assessments?.map((assessment, idx) => ( 
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-muted/50 rounded-md gap-2"
                    >
                      <span className="text-sm font-medium text-foreground">{assessment.type}</span>
                      <span className="text-sm text-muted-foreground">{assessment.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 md:py-12 border border-dashed border-border rounded-lg">
          <BookOpen className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground px-4">No subject data available for this class</p>
        </div>
      )}
    </div>
  );

  switch (activeView) {
    case "overview":
      return renderOverview();
    case "students":
      return renderStudents();
    case "teachers":
      return renderTeachers();
    case "subjects":
      return renderSubjects();
    default:
      return renderOverview();
  }
};

export default ClassViews;