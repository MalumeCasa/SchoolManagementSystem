'use server';

import { db } from './db';
import { subjects, teachers, subjectTeachers, classes } from '@lib/db/schema';
import { eq, like, or, inArray, and, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// READ - Get all subjects with proper filtering to avoid duplicates
export async function getAllSubjects() {
  try {
    const subjectsData = await db
      .select()
      .from(subjects)
      .orderBy(subjects.name);

    return { success: true, data: subjectsData };
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return { error: 'Failed to fetch subjects' };
  }
}

export async function getSubjectById(id: number) {
  try {
    const [subject] = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, id))
      .limit(1);

    if (!subject) {
      return { error: 'Subject not found' };
    }

    return { success: true, data: subject };
  } catch (error) {
    console.error('Error fetching subject:', error);
    return { error: 'Failed to fetch subject' };
  }
}

// Get all teachers for subject assignment
export async function getAllTeachersForSubjects() {
  try {
    const teachersData = await db
      .select({
        id: teachers.id,
        staffId: teachers.staffId,
        name: teachers.name,
        surname: teachers.surname,
        email: teachers.email,
        role: teachers.role,
        subjects: teachers.subjects
      })
      .from(teachers)
      .orderBy(teachers.name);

    return { success: true, data: teachersData };
  } catch (error) {
    console.error('Error fetching teachers for subjects:', error);
    return { error: 'Failed to fetch teachers' };
  }
}

// CREATE - Fixed to prevent duplicate subjects
export async function createSubject(formData: {
  name: string;
  teacher: string;
  teacherIds: number[];
  teacherNames: string[];
  schedule: string;
  duration: string;
  topics: string[];
  assessments: Array<{ type: string; date: string }>;
  className: string;
  classSection: string;
}) {
  try {
    const { name, teacher, teacherIds, teacherNames, schedule, duration, topics, assessments, className, classSection } = formData;

    console.log('createSubject called with:', { name, className, classSection });

    if (!name?.trim() || !teacher?.trim() || !schedule?.trim() || !duration?.trim() || !className?.trim()) {
      return { error: 'Name, teacher, class name, schedule, and duration are required' };
    }

    if (!teacherIds.length || !teacherNames.length) {
      return { error: 'At least one teacher is required' };
    }

    // Check if subject already exists with same name, class, and section
    const [existingSubject] = await db
      .select()
      .from(subjects)
      .where(
        and(
          eq(subjects.name, name.trim()),
          eq(subjects.className, className.trim()),
          eq(subjects.classSection, classSection)
        )
      )
      .limit(1);

    if (existingSubject) {
      return { error: 'A subject with this name already exists for the same class and section' };
    }

    const [newSubject] = await db
      .insert(subjects)
      .values({
        name: name.trim(),
        teacher: teacher.trim(),
        teacherIds: teacherIds,
        teacherNames: teacherNames,
        schedule: schedule.trim(),
        duration: duration.trim(),
        topics: topics || [],
        assessments: assessments || [],
        className: className.trim(),
        classSection: classSection || 'primary'
      })
      .returning();

    console.log('Subject created with ID:', newSubject.id);

    // Create subject-teacher relationships using staffId
    for (let i = 0; i < teacherIds.length; i++) {
      // Get the teacher's id using staffId
      const [teacherRecord] = await db
        .select({ id: teachers.id })
        .from(teachers)
        .where(eq(teachers.staffId, teacherIds[i]))
        .limit(1);

      if (teacherRecord) {
        await db
          .insert(subjectTeachers)
          .values({
            subjectId: newSubject.id,
            teacherId: teacherRecord.id,
            teacherName: teacherNames[i],
            isPrimary: i === 0
          });
      }
    }

    // Sync with classes table - FIXED: Only sync if class doesn't exist
    await syncClassFromSubject(className, classSection, teacherNames, [name]);

    revalidatePath('/academics/subjects');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: newSubject,
      message: 'Subject created successfully'
    };
  } catch (error) {
    console.error('Error creating subject:', error);
    // Check if it's a unique constraint violation
    if (error instanceof Error && (error.message.includes('unique') || error.message.includes('duplicate'))) {
      return { error: 'A subject with these details already exists' };
    }
    return { error: 'Failed to create subject' };
  }
}

// UPDATE - Fixed to prevent duplicates
export async function updateSubject(id: number, formData: {
  name: string;
  teacher: string;
  teacherIds: number[];
  teacherNames: string[];
  schedule: string;
  duration: string;
  topics: string[];
  assessments: Array<{ type: string; date: string }>;
  className: string;
  classSection: string;
}) {
  try {
    const { name, teacher, teacherIds, teacherNames, schedule, duration, topics, assessments, className, classSection } = formData;

    console.log('updateSubject called with:', { id, name, className, classSection });

    if (!name?.trim() || !teacher?.trim() || !schedule?.trim() || !duration?.trim() || !className?.trim()) {
      return { error: 'Name, teacher, class name, schedule, and duration are required' };
    }

    if (!teacherIds.length || !teacherNames.length) {
      return { error: 'At least one teacher is required' };
    }

    // ✅ CORRECTED: Check if another subject already exists with same name, class, and section (excluding current subject)
    const [duplicateSubject] = await db
      .select()
      .from(subjects)
      .where(
        and(
          eq(subjects.name, name.trim()),
          eq(subjects.className, className.trim()),
          eq(subjects.classSection, classSection),
          ne(subjects.id, id)  // ✅ This excludes the current subject
        )
      )
      .limit(1);

    if (duplicateSubject) {
      return { error: 'Another subject with this name already exists for the same class and section' };
    }

    const [updatedSubject] = await db
      .update(subjects)
      .set({
        name: name.trim(),
        teacher: teacher.trim(),
        teacherIds: teacherIds,
        teacherNames: teacherNames,
        schedule: schedule.trim(),
        duration: duration.trim(),
        topics: topics || [],
        assessments: assessments || [],
        className: className.trim(),
        classSection: classSection || 'primary',
      })
      .where(eq(subjects.id, id))
      .returning();

    console.log('Subject updated with ID:', updatedSubject.id);

    // Update subject-teacher relationships
    // First delete existing relationships
    await db
      .delete(subjectTeachers)
      .where(eq(subjectTeachers.subjectId, id));

    // Then create new relationships using staffId
    for (let i = 0; i < teacherIds.length; i++) {
      const [teacherRecord] = await db
        .select({ id: teachers.id })
        .from(teachers)
        .where(eq(teachers.staffId, teacherIds[i]))
        .limit(1);

      if (teacherRecord) {
        await db
          .insert(subjectTeachers)
          .values({
            subjectId: id,
            teacherId: teacherRecord.id,
            teacherName: teacherNames[i],
            isPrimary: i === 0
          });
      }
    }

    // Sync with classes table - FIXED: Only update if needed
    await syncClassFromSubject(className, classSection, teacherNames, [name]);

    revalidatePath('/academics/subjects');
    revalidatePath(`/academics/subjects/${id}`);

    return {
      success: true,
      data: updatedSubject,
      message: 'Subject updated successfully'
    };
  } catch (error) {
    console.error('Error updating subject:', error);
    return { error: 'Failed to update subject' };
  }
}

// DELETE - No changes needed
export async function deleteSubject(id: number) {
  try {
    const [subject] = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, id))
      .limit(1);

    if (!subject) {
      return { error: 'Subject not found' };
    }

    // First delete subject-teacher relationships
    await db
      .delete(subjectTeachers)
      .where(eq(subjectTeachers.subjectId, id));

    // Then delete the subject
    await db
      .delete(subjects)
      .where(eq(subjects.id, id));

    // Update classes table after deletion
    await updateClassesAfterSubjectDeletion();

    revalidatePath('/academics/subjects');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Subject deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting subject:', error);
    return { error: 'Failed to delete subject' };
  }
}

// SEARCH - No changes needed
export async function searchSubjects(query: string) {
  try {
    if (!query.trim()) {
      return await getAllSubjects();
    }

    const searchTerm = `%${query}%`;

    const results = await db
      .select()
      .from(subjects)
      .where(
        or(
          like(subjects.name, searchTerm),
          like(subjects.teacher, searchTerm),
          like(subjects.className, searchTerm),
          like(subjects.classSection, searchTerm)
        )
      )
      .orderBy(subjects.name);

    return { success: true, data: results };
  } catch (error) {
    console.error('Error searching subjects:', error);
    return { error: 'Failed to search subjects' };
  }
}

// FIXED: Helper function to sync class from subject - Prevent duplicate class creation
async function syncClassFromSubject(className: string, classSection: string, teacherNames: string[], subjectNames: string[]) {
  try {
    console.log('syncClassFromSubject called with:', { className, classSection });
    
    // Add a small delay to prevent race conditions
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Check if class already exists with the same name and section
    const [existingClass] = await db
      .select()
      .from(classes)
      .where(
        and(
          eq(classes.className, className),
          eq(classes.classSection, classSection)
        )
      )
      .limit(1);

    if (existingClass) {
      console.log('Class exists, updating:', existingClass.id);
      // Update existing class - merge teachers and subjects without duplicates
      const updatedTeachers = Array.from(new Set([...existingClass.teachers, ...teacherNames]));
      const updatedSubjects = Array.from(new Set([...existingClass.subjects, ...subjectNames]));

      // Only update if there are actual changes
      if (updatedTeachers.length !== existingClass.teachers.length || 
          updatedSubjects.length !== existingClass.subjects.length) {
        await db
          .update(classes)
          .set({
            teachers: updatedTeachers,
            subjects: updatedSubjects
          })
          .where(
            and(
              eq(classes.className, className),
              eq(classes.classSection, classSection)
            )
          );
        console.log('Class updated successfully');
      } else {
        console.log('No changes needed for class');
      }
    } else {
      console.log('Class does not exist, creating new class');
      // Create new class only if it doesn't exist
      await db
        .insert(classes)
        .values({
          className: className,
          classSection: classSection,
          teachers: teacherNames,
          subjects: subjectNames
        });
      console.log('New class created successfully');
    }
  } catch (error) {
    console.error('Error syncing class from subject:', error);
    // Don't throw error - class sync shouldn't prevent subject creation
  }
}

// Helper function to update classes after subject deletion - SIMPLIFIED VERSION
async function updateClassesAfterSubjectDeletion() {
  try {
    // Get all classes
    const allClasses = await db.select().from(classes);
    
    // For each class, get its subjects and update the class record
    for (const classRecord of allClasses) {
      const classSubjects = await db
        .select({
          teacherNames: subjects.teacherNames,
          name: subjects.name
        })
        .from(subjects)
        .where(
          and(
            eq(subjects.className, classRecord.className),
            eq(subjects.classSection, classRecord.classSection)
          )
        );

      if (classSubjects.length === 0) {
        // Delete class if no subjects exist
        await db
          .delete(classes)
          .where(
            and(
              eq(classes.className, classRecord.className),
              eq(classes.classSection, classRecord.classSection)
            )
          );
      } else {
        // Update class with current teachers and subjects
        const allTeachers = new Set<string>();
        const allSubjects = new Set<string>();
        
        classSubjects.forEach(subject => {
          subject.teacherNames.forEach(teacher => allTeachers.add(teacher));
          allSubjects.add(subject.name);
        });

        await db
          .update(classes)
          .set({
            teachers: Array.from(allTeachers),
            subjects: Array.from(allSubjects)
          })
          .where(
            and(
              eq(classes.className, classRecord.className),
              eq(classes.classSection, classRecord.classSection)
            )
          );
      }
    }
  } catch (error) {
    console.error('Error updating classes after subject deletion:', error);
  }
}

// NEW: Function to check for duplicate subjects before creation
export async function checkDuplicateSubject(name: string, className: string, classSection: string, excludeId?: number) {
  try {
    const [existingSubject] = await db
      .select()
      .from(subjects)
      .where(
        excludeId 
          ? and(
              eq(subjects.name, name),
              eq(subjects.className, className),
              eq(subjects.classSection, classSection),
              ne(subjects.id, excludeId)
            )
          : and(
              eq(subjects.name, name),
              eq(subjects.className, className),
              eq(subjects.classSection, classSection)
            )
      )
      .limit(1);

    return { exists: !!existingSubject, subject: existingSubject };
  } catch (error) {
    console.error('Error checking for duplicate subject:', error);
    return { exists: false, subject: null };
  }
}

// Get teachers by their IDs
export async function getTeachersByIds(teacherIds: number[]) {
  try {
    if (!teacherIds.length) {
      return { success: true, data: [] };
    }

    const teachersData = await db
      .select()
      .from(teachers)
      .where(inArray(teachers.staffId, teacherIds))
      .orderBy(teachers.name);

    return { success: true, data: teachersData };
  } catch (error) {
    console.error('Error fetching teachers by IDs:', error);
    return { error: 'Failed to fetch teachers' };
  }
}