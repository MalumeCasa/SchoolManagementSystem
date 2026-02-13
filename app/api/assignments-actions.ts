// app/actions/assignments.ts
'use server';

import { db } from '@api/db';
import { assignments, assignmentSubmissions, classes, subjects, teachers, students } from '@lib/db/schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Types
export interface AssignmentData {
  title: string;
  description?: string;
  instructions?: string;
  classId: number;
  subjectId: number;
  teacherId: number;
  assignedDate: string;
  dueDate: string;
  totalMarks?: number;
  passingMarks?: number;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface SubmissionData {
  assignmentId: number;
  studentId: number;
  submissionText?: string;
  submissionUrl?: string;
  submissionFileName?: string;
}

export interface GradingData {
  submissionId: number;
  marksObtained: number;
  feedback?: string;
  gradedBy: number;
}

// Create Assignment
export async function createAssignment(
  data: AssignmentData
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const [assignment] = await db
      .insert(assignments)
      .values({
        ...data,
        isPublished: true,
        status: 'published',
      })
      .returning();

    revalidatePath('/assignments');
    return { success: true, data: assignment };
  } catch (error) {
    console.error('Error creating assignment:', error);
    return { success: false, error: 'Failed to create assignment' };
  }
}

// Update Assignment
export async function updateAssignment(
  id: number,
  data: Partial<AssignmentData>
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const [assignment] = await db
      .update(assignments)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(assignments.id, id))
      .returning();

    revalidatePath('/assignments');
    revalidatePath(`/assignments/${id}`);
    return { success: true, data: assignment };
  } catch (error) {
    console.error('Error updating assignment:', error);
    return { success: false, error: 'Failed to update assignment' };
  }
}


// Get Assignments with filters - FIXED VERSION
export async function getAssignments(filters?: {
  classId?: number;
  subjectId?: number;
  teacherId?: number;
  status?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Build the base query
    const baseQuery = db
      .select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        assignedDate: assignments.assignedDate,
        dueDate: assignments.dueDate,
        totalMarks: assignments.totalMarks,
        status: assignments.status,
        isPublished: assignments.isPublished,
        class: {
          id: classes.id,
          name: classes.className,
        },
        subject: {
          id: subjects.id,
          name: subjects.name,
        },
        teacher: {
          id: teachers.id,
          name: teachers.name,
        },
        submissionCount: count(assignmentSubmissions.id),
      })
      .from(assignments)
      .leftJoin(classes, eq(assignments.classId, classes.id))
      .leftJoin(subjects, eq(assignments.subjectId, subjects.id))
      .leftJoin(teachers, eq(assignments.teacherId, teachers.id))
      .leftJoin(assignmentSubmissions, eq(assignments.id, assignmentSubmissions.assignmentId))
      .groupBy(
        assignments.id,
        classes.id,
        subjects.id,
        teachers.id
      );

    // Apply filters using conditional where clauses
    let whereConditions = [];
    
    if (filters?.classId) {
      whereConditions.push(eq(assignments.classId, filters.classId));
    }
    if (filters?.subjectId) {
      whereConditions.push(eq(assignments.subjectId, filters.subjectId));
    }
    if (filters?.teacherId) {
      whereConditions.push(eq(assignments.teacherId, filters.teacherId));
    }
    if (filters?.status) {
      whereConditions.push(eq(assignments.status, filters.status));
    }

    // Apply where conditions if any exist
    const finalQuery = whereConditions.length > 0 
      ? baseQuery.where(and(...whereConditions))
      : baseQuery;

    // Add ordering
    const data = await finalQuery.orderBy(desc(assignments.dueDate));

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return { success: false, error: 'Failed to fetch assignments' };
  }
}

// Get Assignment by ID with details
export async function getAssignmentById(
  id: number
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const [assignment] = await db
      .select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        instructions: assignments.instructions,
        assignedDate: assignments.assignedDate,
        dueDate: assignments.dueDate,
        totalMarks: assignments.totalMarks,
        passingMarks: assignments.passingMarks,
        status: assignments.status,
        attachmentUrl: assignments.attachmentUrl,
        attachmentName: assignments.attachmentName,
        class: {
          id: classes.id,
          name: classes.className,
        },
        subject: {
          id: subjects.id,
          name: subjects.name,
        },
        teacher: {
          id: teachers.id,
          name: teachers.name,
        },
      })
      .from(assignments)
      .where(eq(assignments.id, id))
      .leftJoin(classes, eq(assignments.classId, classes.id))
      .leftJoin(subjects, eq(assignments.subjectId, subjects.id))
      .leftJoin(teachers, eq(assignments.teacherId, teachers.id));

    if (!assignment) {
      return { success: false, error: 'Assignment not found' };
    }

    return { success: true, data: assignment };
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return { success: false, error: 'Failed to fetch assignment' };
  }
}

// Submit Assignment
export async function submitAssignment(
  data: SubmissionData
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const [submission] = await db
      .insert(assignmentSubmissions)
      .values({
        ...data,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      })
      .returning();

    revalidatePath('/assignments');
    revalidatePath('/my-assignments');
    return { success: true, data: submission };
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return { success: false, error: 'Failed to submit assignment' };
  }
}

// Grade Assignment Submission
export async function gradeSubmission(
  data: GradingData
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const [submission] = await db
      .update(assignmentSubmissions)
      .set({
        marksObtained: data.marksObtained,
        feedback: data.feedback,
        gradedBy: data.gradedBy,
        gradedAt: new Date().toISOString(),
        status: 'graded',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(assignmentSubmissions.id, data.submissionId))
      .returning();

    revalidatePath('/assignments');
    revalidatePath('/grading');
    return { success: true, data: submission };
  } catch (error) {
    console.error('Error grading submission:', error);
    return { success: false, error: 'Failed to grade submission' };
  }
}

// Get Submissions for Assignment
export async function getAssignmentSubmissions(
  assignmentId: number
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const submissions = await db
      .select({
        id: assignmentSubmissions.id,
        submissionText: assignmentSubmissions.submissionText,
        submissionUrl: assignmentSubmissions.submissionUrl,
        submissionFileName: assignmentSubmissions.submissionFileName,
        marksObtained: assignmentSubmissions.marksObtained,
        feedback: assignmentSubmissions.feedback,
        status: assignmentSubmissions.status,
        submittedAt: assignmentSubmissions.submittedAt,
        gradedAt: assignmentSubmissions.gradedAt,
        student: {
          id: students.id,
          name: students.name,
          surname: students.surname,
        },
        grader: {
          id: teachers.id,
          name: teachers.name,
        },
      })
      .from(assignmentSubmissions)
      .where(eq(assignmentSubmissions.assignmentId, assignmentId))
      .leftJoin(students, eq(assignmentSubmissions.studentId, students.id))
      .leftJoin(teachers, eq(assignmentSubmissions.gradedBy, teachers.id))
      .orderBy(desc(assignmentSubmissions.submittedAt));

    return { success: true, data: submissions };
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return { success: false, error: 'Failed to fetch submissions' };
  }
}

// Get Student Assignments
export async function getStudentAssignments(
  studentId: number,
  classId: number
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const studentAssignments = await db
      .select({
        assignment: {
          id: assignments.id,
          title: assignments.title,
          description: assignments.description,
          dueDate: assignments.dueDate,
          totalMarks: assignments.totalMarks,
          status: assignments.status,
        },
        subject: {
          id: subjects.id,
          name: subjects.name,
        },
        teacher: {
          id: teachers.id,
          name: teachers.name,
        },
        submission: {
          id: assignmentSubmissions.id,
          status: assignmentSubmissions.status,
          submittedAt: assignmentSubmissions.submittedAt,
          marksObtained: assignmentSubmissions.marksObtained,
        },
      })
      .from(assignments)
      .where(
        and(
          eq(assignments.classId, classId),
          eq(assignments.status, 'published')
        )
      )
      .leftJoin(subjects, eq(assignments.subjectId, subjects.id))
      .leftJoin(teachers, eq(assignments.teacherId, teachers.id))
      .leftJoin(
        assignmentSubmissions,
        and(
          eq(assignmentSubmissions.assignmentId, assignments.id),
          eq(assignmentSubmissions.studentId, studentId)
        )
      )
      .orderBy(assignments.dueDate);

    return { success: true, data: studentAssignments };
  } catch (error) {
    console.error('Error fetching student assignments:', error);
    return { success: false, error: 'Failed to fetch student assignments' };
  }
}

// Delete Assignment
export async function deleteAssignment(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // First delete submissions
    await db.delete(assignmentSubmissions).where(eq(assignmentSubmissions.assignmentId, id));
    
    // Then delete assignment
    await db.delete(assignments).where(eq(assignments.id, id));

    revalidatePath('/assignments');
    return { success: true };
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return { success: false, error: 'Failed to delete assignment' };
  }
}

// Toggle Assignment Status
export async function toggleAssignmentStatus(
  id: number,
  status: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const [assignment] = await db
      .update(assignments)
      .set({
        status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(assignments.id, id))
      .returning();

    revalidatePath('/assignments');
    return { success: true, data: assignment };
  } catch (error) {
    console.error('Error toggling assignment status:', error);
    return { success: false, error: 'Failed to update assignment status' };
  }
}