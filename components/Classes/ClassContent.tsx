"use client"

import React from 'react';
import { GraduationCap, Users } from "lucide-react";
import { ActiveView, ClassData, Student, Teacher, Subject } from '@api/types';
import ClassViews from './ClassViews';

interface ClassContentProps {
  selectedClass: string | null;
  activeView: ActiveView;
  classDataState: Record<string, ClassData>;
  studentsDataState: Record<string, Student[]>;
  teachersDataState: Record<string, Teacher[]>;
  subjectsDataState: Record<string, Subject[]>;
  loading: boolean;
  onSetActiveView: (view: ActiveView) => void;
  onRefreshStudentsData: () => void;
}

const ClassContent: React.FC<ClassContentProps> = ({
  selectedClass,
  activeView,
  classDataState,
  studentsDataState,
  teachersDataState,
  subjectsDataState,
  loading,
  onSetActiveView,
  onRefreshStudentsData,
}) => {
  if (loading && !selectedClass) {
    return (
      <div className="text-center py-8 md:py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-muted mb-4">
          <Users className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
        </div>
        <p className="text-base md:text-lg text-muted-foreground">Loading student data...</p>
        <p className="text-sm text-muted-foreground mt-2">Fetching from database...</p>
      </div>
    );
  }

  if (!selectedClass) {
    return (
      <div className="text-center py-8 md:py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-muted mb-4">
          <GraduationCap className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
        </div>
        <p className="text-base md:text-lg text-muted-foreground px-4">Select a class from the sidebar to view details</p>
        <p className="text-sm text-muted-foreground mt-2 px-4">
          Classes with student data: {Object.keys(studentsDataState).join(', ') || 'None'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">{selectedClass}</h2>
        <div className="text-sm text-muted-foreground">
          {studentsDataState[selectedClass]?.length || 0} students • 
          {classDataState[selectedClass]?.subjects || 0} subjects
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
        <button
          onClick={() => onSetActiveView("overview")}
          className={`px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
            activeView === "overview"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => onSetActiveView("students")}
          className={`px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
            activeView === "students"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Students ({studentsDataState[selectedClass]?.length || 0})
        </button>
        <button
          onClick={() => onSetActiveView("teachers")}
          className={`px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
            activeView === "teachers"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Teachers
        </button>
        <button
          onClick={() => onSetActiveView("subjects")}
          className={`px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
            activeView === "subjects"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Subjects
        </button>
      </div>

      <ClassViews
        activeView={activeView}
        selectedClass={selectedClass}
        classDataState={classDataState}
        studentsDataState={studentsDataState}
        teachersDataState={teachersDataState}
        subjectsDataState={subjectsDataState}
        loading={loading}
        onRefreshStudentsData={onRefreshStudentsData}
      />
    </div>
  );
};

export default ClassContent;