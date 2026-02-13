// app/exams/components/exam-form.tsx
'use client'

import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { Select } from "@/components/FormElements/select";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { useState, useEffect, useCallback } from 'react';
import { createExam, updateExam, getExamById } from '@api/exam-actions';
import { getAllClasses } from '@api/class-actions';
import { getAllSubjects } from '@api/subject-actions';

interface ExamFormState {
  id?: number;
  name: string;
  description: string;
  examDate: string;
  startTime: string;
  endTime: string;
  classId: number;
  subjectId: number;
  totalMarks: number;
  passingMarks: number;
  academicYear: string;
  term: number;
  weightage: number;
}

interface ClassOption {
  id: number;
  className: string;
  classSection: string;
}

interface SubjectOption {
  id: number;
  name: string;
  className: string;
}

export function ExamForm({ examId, onSuccess }: { examId?: number; onSuccess?: () => void }) {
  const [examForm, setExamForm] = useState<ExamFormState>({
    name: '',
    description: '',
    examDate: '',
    startTime: '',
    endTime: '',
    classId: 0,
    subjectId: 1,
    totalMarks: 100,
    passingMarks: 40,
    academicYear: new Date().getFullYear().toString(),
    term: 1,
    weightage: 100,
  });

  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<SubjectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Academic year options (current year and next year)
  const academicYearOptions = [
    { label: `${new Date().getFullYear()}`, value: new Date().getFullYear().toString() },
    { label: `${new Date().getFullYear() + 1}`, value: (new Date().getFullYear() + 1).toString() },
  ];

  // Term options
  const termOptions = [
    { label: "Term 1", value: "1" },
    { label: "Term 2", value: "2" },
    { label: "Term 3", value: "3" },
    { label: "Term 4", value: "4" },
  ];

  // Load classes and subjects
  useEffect(() => {
    const loadData = async () => {
      try {
        const classesData = await getAllClasses();
        const subjectsData = await getAllSubjects();

        if (classesData.success) {
          setClasses(classesData.data || []);
        }

        if (subjectsData.success) {
          setSubjects(subjectsData.data || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Load exam data if editing
  useEffect(() => {
    if (examId) {
      const loadExam = async () => {
        setIsLoading(true);
        try {
          const examData = await getExamById(examId);
          if (examData.success && examData.data) {
            const exam = examData.data;
            setExamForm({
              id: exam.id,
              name: exam.name || '',
              description: exam.description || '',
              examDate: exam.examDate || '',
              startTime: exam.startTime || '',
              endTime: exam.endTime || '',
              classId: exam.classId || 0,
              subjectId: exam.subjectId || 1,
              totalMarks: exam.totalMarks || 100,
              passingMarks: exam.passingMarks || 40,
              academicYear: exam.academicYear || new Date().getFullYear().toString(),
              term: exam.term || 1,
              weightage: exam.weightage || 100,
            });
            setIsEditing(true);
            
            // Filter subjects based on selected class
            if (exam.classId) {
              const filtered = subjects.filter(subject => subject.className === exam.className);
              setFilteredSubjects(filtered);
            }
          }
        } catch (error) {
          console.error('Error loading exam:', error);
        }
        setIsLoading(false);
      };

      loadExam();
    }
  }, [examId, subjects]);

  // Filter subjects when class changes
  useEffect(() => {
    if (examForm.classId) {
      const selectedClass = classes.find(c => c.id === examForm.classId);
      if (selectedClass) {
        const filtered = subjects.filter(subject => 
          subject.className === selectedClass.className
        );
        setFilteredSubjects(filtered);
        
        // Reset subject if it's not in the filtered list
        if (examForm.subjectId && !filtered.some(s => s.id === examForm.subjectId)) {
          setExamForm(prev => ({ ...prev, subjectId: 0 }));
        }
      }
    } else {
      setFilteredSubjects([]);
    }
  }, [examForm.classId, examForm.subjectId, classes, subjects]); // Added examForm.subjectId

  const handleExamFormChange = (field: keyof ExamFormState, value: string | number) => {
    setExamForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = {
        name: examForm.name,
        description: examForm.description,
        examDate: examForm.examDate,
        startTime: examForm.startTime,
        endTime: examForm.endTime,
        classId: examForm.classId,
        subjectId: examForm.subjectId,
        totalMarks: examForm.totalMarks,
        passingMarks: examForm.passingMarks,
        academicYear: examForm.academicYear,
        term: examForm.term,
        weightage: examForm.weightage,
      };

      let result;
      if (isEditing && examForm.id) {
        result = await updateExam(examForm.id, formData);
      } else {
        result = await createExam(formData);
      }

      if (result.success) {
        if (onSuccess) {
          onSuccess();
        }
        // Show success message or redirect
        alert(`Exam ${isEditing ? 'updated' : 'created'} successfully!`);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('An error occurred while submitting the exam.');
    }
    setIsLoading(false);
  };

  if (isLoading && examId) {
    return (
      <ShowcaseSection title="Loading Exam..." className="!p-6.5">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ShowcaseSection>
    );
  }

  return (
    <ShowcaseSection
      title={isEditing ? "Edit Exam" : "Create New Exam"}
      className="!p-6.5"
    >
      <form onSubmit={handleSubmit}>
        {/* BASIC EXAM INFORMATION */}
        <ShowcaseSection
          title="BASIC EXAM INFORMATION"
          className="space-y-5.5 !p-6.5 mb-4.5"
        >
          <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
            <InputGroup
              label="EXAM NAME"
              name="name"
              type="text"
              placeholder="Enter exam name (e.g., Mid-Term, Final Exam)"
              className="w-full xl:w-1/2"
              value={examForm.name}
              onChange={(e) => handleExamFormChange('name', e.target.value)}
              required
            />

            <InputGroup
              label="EXAM DATE"
              name="examDate"
              type="date"
              placeholder="Select exam date"
              className="w-full xl:w-1/2"
              value={examForm.examDate}
              onChange={(e) => handleExamFormChange('examDate', e.target.value)}
              required
            />
          </div>

          <TextAreaGroup
            label="EXAM DESCRIPTION"
            name="description"
            placeholder="Enter exam description, instructions, or additional notes..."
            className="w-full"
            value={examForm.description}
            onChange={(e) => handleExamFormChange('description', e.target.value)}
          />

          <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
            <InputGroup
              label="START TIME"
              name="startTime"
              type="time"
              placeholder="Start time"
              className="w-full xl:w-1/2"
              value={examForm.startTime}
              onChange={(e) => handleExamFormChange('startTime', e.target.value)}
            />

            <InputGroup
              label="END TIME"
              name="endTime"
              type="time"
              placeholder="End time"
              className="w-full xl:w-1/2"
              value={examForm.endTime}
              onChange={(e) => handleExamFormChange('endTime', e.target.value)}
            />
          </div>
        </ShowcaseSection>

        {/* ACADEMIC DETAILS */}
        <ShowcaseSection
          title="ACADEMIC DETAILS"
          className="space-y-5.5 !p-6.5 mb-4.5"
        >
          <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
            <Select
              label="CLASS"
              name="classId"
              placeholder="SELECT CLASS"
              className="w-full xl:w-1/2"
              items={classes.map(cls => ({
                label: `${cls.className} - ${cls.classSection}`,
                value: cls.id.toString()
              }))}
              value={examForm.classId.toString()}
              onChange={(value: string) => handleExamFormChange('classId', parseInt(value))}
              required
            />

            <Select
              label="SUBJECT"
              name="subjectId"
              placeholder={examForm.classId ? "SELECT SUBJECT" : "SELECT CLASS FIRST"}
              className="w-full xl:w-1/2"
              items={filteredSubjects.map(subject => ({
                label: subject.name,
                value: subject.id.toString()
              }))}
              value={examForm.subjectId.toString()}
              onChange={(value: string) => handleExamFormChange('subjectId', parseInt(value))}
              required
              disabled={!examForm.classId}
            />
          </div>

          <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
            <Select
              label="ACADEMIC YEAR"
              name="academicYear"
              placeholder="SELECT ACADEMIC YEAR"
              className="w-full xl:w-1/2"
              items={academicYearOptions}
              value={examForm.academicYear}
              onChange={(value: string) => handleExamFormChange('academicYear', value)}
              required
            />

            <Select
              label="TERM"
              name="term"
              placeholder="SELECT TERM"
              className="w-full xl:w-1/2"
              items={termOptions}
              value={examForm.term.toString()}
              onChange={(value: string) => handleExamFormChange('term', parseInt(value))}
              required
            />
          </div>
        </ShowcaseSection>

        {/* MARKS & GRADING */}
        <ShowcaseSection
          title="MARKS & GRADING"
          className="space-y-5.5 !p-6.5 mb-4.5"
        >
          <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
            <InputGroup
              label="TOTAL MARKS"
              name="totalMarks"
              type="number"
              placeholder="Enter total marks"
              className="w-full xl:w-1/2"
              value={examForm.totalMarks.toString()}
              onChange={(e) => handleExamFormChange('totalMarks', parseInt(e.target.value) || 0)}
              required
              min="1"
            />

            <InputGroup
              label="PASSING MARKS"
              name="passingMarks"
              type="number"
              placeholder="Enter passing marks"
              className="w-full xl:w-1/2"
              value={examForm.passingMarks.toString()}
              onChange={(e) => handleExamFormChange('passingMarks', parseInt(e.target.value) || 0)}
              required
              min="0"
              max={examForm.totalMarks}
            />
          </div>

          <div className="mb-4.5">
            <InputGroup
              label="WEIGHTAGE (%)"
              name="weightage"
              type="number"
              placeholder="Enter weightage percentage"
              className="w-full xl:w-1/2"
              value={examForm.weightage.toString()}
              onChange={(e) => handleExamFormChange('weightage', parseInt(e.target.value) || 0)}
              required
              min="0"
              max="100"
              helpText="Percentage weight of this exam in final grade calculation"
            />
          </div>
        </ShowcaseSection>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 flex w-full justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isEditing ? 'Updating Exam...' : 'Creating Exam...'}
            </div>
          ) : (
            isEditing ? 'Update Exam' : 'Create Exam'
          )}
        </button>
      </form>
    </ShowcaseSection>
  );
}