// app/actions/exams.ts
'use server';

import { db } from '@api/db';
import { exams, examResults, classes, subjects, students } from '@lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Define the Exam type based on your actual data structure
export interface Exam {
  id: number;
  name: string;
  description: string | null;
  examDate: string;
  startTime: string | null;
  endTime: string | null;
  totalMarks: number | null;
  passingMarks: number | null;
  className: string | null;
  subjectName: string | null;
  academicYear: string;
  term: number;
  createdAt: string | null;
}

// Create new exam
export async function createExam(formData: {
  name: string;
  description?: string;
  examDate: string;
  startTime?: string;
  endTime?: string;
  classId: number;
  subjectId?: number;
  totalMarks?: number;
  passingMarks?: number;
  academicYear: string;
  term: number;
  weightage?: number;
}) {
  try {
    const [exam] = await db.insert(exams).values({
      name: formData.name,
      description: formData.description,
      examDate: formData.examDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      classId: formData.classId,
      subjectId: formData.subjectId,
      totalMarks: formData.totalMarks || 100,
      passingMarks: formData.passingMarks || 40,
      academicYear: formData.academicYear,
      term: formData.term,
      weightage: formData.weightage || 100,
    }).returning();

    revalidatePath('/exams');
    return { success: true, data: exam };
  } catch (error) {
    console.error('Error creating exam:', error);
    return { success: false, error: 'Failed to create exam' };
  }
}

// Get all exams with class and subject details
export async function getExams(): Promise<{
  success: boolean;
  data?: Exam[];
  error?: string;
}> {
  try {
    const examList = await db
      .select({
        id: exams.id,
        name: exams.name,
        description: exams.description,
        examDate: exams.examDate,
        startTime: exams.startTime,
        endTime: exams.endTime,
        totalMarks: exams.totalMarks,
        passingMarks: exams.passingMarks,
        className: classes.className,
        subjectName: subjects.name,
        academicYear: exams.academicYear,
        term: exams.term,
        createdAt: exams.createdAt,
      })
      .from(exams)
      .leftJoin(classes, eq(exams.classId, classes.id))
      .leftJoin(subjects, eq(exams.subjectId, subjects.id))
      .orderBy(desc(exams.examDate));

    return { success: true, data: examList as Exam[] };
  } catch (error) {
    console.error('Error fetching exams:', error);
    return { success: false, error: 'Failed to fetch exams' };
  }
}

// Get exam by ID with full details
export async function getExamById(id: number): Promise<{
  success: boolean;
  data?: Exam & {
    classId: number;
    subjectId: number | null;
    weightage: number | null;
    updatedAt: string | null;
  };
  error?: string;
}> {
  try {
    const [exam] = await db
      .select({
        id: exams.id,
        name: exams.name,
        description: exams.description,
        examDate: exams.examDate,
        startTime: exams.startTime,
        endTime: exams.endTime,
        totalMarks: exams.totalMarks,
        passingMarks: exams.passingMarks,
        classId: exams.classId,
        subjectId: exams.subjectId,
        academicYear: exams.academicYear,
        term: exams.term,
        weightage: exams.weightage,
        className: classes.className,
        subjectName: subjects.name,
        createdAt: exams.createdAt,
        updatedAt: exams.updatedAt,
      })
      .from(exams)
      .where(eq(exams.id, id))
      .leftJoin(classes, eq(exams.classId, classes.id))
      .leftJoin(subjects, eq(exams.subjectId, subjects.id));

    return { success: true, data: exam };
  } catch (error) {
    console.error('Error fetching exam:', error);
    return { success: false, error: 'Failed to fetch exam' };
  }
}

// Update exam
export async function updateExam(id: number, formData: Partial<typeof exams.$inferInsert>) {
  try {
    const [updatedExam] = await db
      .update(exams)
      .set({
        ...formData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(exams.id, id))
      .returning();

    revalidatePath('/exams');
    return { success: true, data: updatedExam };
  } catch (error) {
    console.error('Error updating exam:', error);
    return { success: false, error: 'Failed to update exam' };
  }
}

// Delete exam
export async function deleteExam(id: number) {
  try {
    await db.delete(exams).where(eq(exams.id, id));
    revalidatePath('/exams');
    return { success: true };
  } catch (error) {
    console.error('Error deleting exam:', error);
    return { success: false, error: 'Failed to delete exam' };
  }
}

// Add exam result
export async function addExamResult(formData: {
  examId: number;
  studentId: number;
  marksObtained: number;
  grade?: string;
  status?: string;
  comments?: string;
}) {
  try {
    const [result] = await db.insert(examResults).values({
      examId: formData.examId,
      studentId: formData.studentId,
      marksObtained: formData.marksObtained.toString(),
      grade: formData.grade,
      status: formData.status || 'pending',
      comments: formData.comments,
    }).returning();

    revalidatePath(`/exams/${formData.examId}/results`);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error adding exam result:', error);
    return { success: false, error: 'Failed to add exam result' };
  }
}

// Get exam results for a specific exam
export async function getExamResults(examId: number) {
  try {
    const results = await db
      .select({
        id: examResults.id,
        marksObtained: examResults.marksObtained,
        grade: examResults.grade,
        status: examResults.status,
        comments: examResults.comments,
        studentName: students.name,
        studentSurname: students.surname,
        studentId: students.id,
        createdAt: examResults.createdAt,
      })
      .from(examResults)
      .where(eq(examResults.examId, examId))
      .leftJoin(students, eq(examResults.studentId, students.id))
      .orderBy(students.surname, students.name);

    return { success: true, data: results };
  } catch (error) {
    console.error('Error fetching exam results:', error);
    return { success: false, error: 'Failed to fetch exam results' };
  }
}

// Get students for a specific class (for bulk results entry)
export async function getStudentsByClass(classId: number) {
  try {
    const studentList = await db
      .select({
        id: students.id,
        name: students.name,
        surname: students.surname,
      })
      .from(students)
      .where(eq(students.class, classId.toString())) // Note: students.class is text in your schema
      .orderBy(students.surname, students.name);

    return { success: true, data: studentList };
  } catch (error) {
    console.error('Error fetching students:', error);
    return { success: false, error: 'Failed to fetch students' };
  }
}