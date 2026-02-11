'use server';

import { db } from './db';
import { classes, students, teachers, subjects } from '@lib/db/schema';
import { eq, like, arrayOverlaps, and, or, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ===== CLASS ACTIONS =====

export async function createClass(formData: FormData) {
  try {
    const className = formData.get('className') as string;
    const classSection = formData.get('classSection') as string;
    const subjectsInput = formData.get('subjects') as string;
    
    // Handle teachers from both checkbox selections and hidden input
    const teachersFromForm = formData.getAll('teachers');
    
    // FIXED: Ensure all teacher values are strings
    const teachers = Array.isArray(teachersFromForm) 
      ? teachersFromForm
          .filter(t => typeof t === 'string' && t.trim())
          .map(t => t as string) // Explicitly cast to string
      : [];

    if (!className?.trim()) {
      return { error: 'Class name is required' };
    }

    if (teachers.length === 0) {
      return { error: 'At least one teacher is required' };
    }

    if (!subjectsInput?.trim()) {
      return { error: 'At least one subject is required' };
    }

    if (!classSection?.trim()) {
      return { error: 'Class section is required' };
    }

    // Process subjects from comma-separated string to array
    const subjectsArray = subjectsInput.split(',').map(s => s.trim()).filter(s => s);

    const existingClass = await db
      .select()
      .from(classes)
      .where(eq(classes.className, className.trim()))
      .limit(1);

    if (existingClass.length > 0) {
      return { error: 'A class with this name already exists' };
    }

    // FIXED: Explicitly type the values object
    const [newClass] = await db
      .insert(classes)
      .values({
        className: className.trim(),
        teachers: teachers, // Now properly typed as string[]
        subjects: subjectsArray,
        classSection: classSection.trim(),
      })
      .returning();

    revalidatePath('/classes');
    revalidatePath('/academics/classes');
    revalidatePath('/dashboard');

    // Return success with redirect indication
    return {
      success: true,
      data: newClass,
      message: 'Class created successfully',
      redirect: '/classes'
    };
  } catch (error) {
    console.error('Error creating class:', error);
    return { error: 'Failed to create class. Please try again.' };
  }
}

// Enhanced createClass with automatic redirect
export async function createClassAndRedirect(formData: FormData) {
  const result = await createClass(formData);
  
  if (result.success) {
    redirect('/academics/classes');
  }
  
  return result;
}

export async function getAllClasses() {
  try {
    const allClasses = await db
      .select()
      .from(classes)
      .orderBy(classes.className);

    return { success: true, data: allClasses };
  } catch (error) {
    console.error('Error fetching classes:', error);
    return { error: 'Failed to fetch classes' };
  }
}

export async function getClassById(id: number) {
  try {
    const [classData] = await db
      .select()
      .from(classes)
      .where(eq(classes.id, id))
      .limit(1);

    if (!classData) {
      return { error: 'Class not found' };
    }

    return { success: true, data: classData };
  } catch (error) {
    console.error('Error fetching class:', error);
    return { error: 'Failed to fetch class' };
  }
}

export async function getClassByName(className: string) {
  try {
    const [classData] = await db
      .select()
      .from(classes)
      .where(eq(classes.className, className))
      .limit(1);

    if (!classData) {
      return { error: 'Class not found' };
    }

    return { success: true, data: classData };
  } catch (error) {
    console.error('Error fetching class:', error);
    return { error: 'Failed to fetch class' };
  }
}

// UPDATED: Enhanced updateClass function with fixed duplicate check and type safety
export async function updateClass(id: number, data: {
  className: string;
  teachers: string[];
  subjects: string[];
  classSection?: string;
} | FormData) {
  try {
    let className: string;
    let classSection: string;
    let teachersArray: string[];
    let subjectsArray: string[];

    // Handle both FormData and object input
    if (data instanceof FormData) {
      // Original FormData handling
      className = data.get('className') as string;
      classSection = data.get('classSection') as string;
      const subjectsInput = data.get('subjects') as string;
      
      const teachersFromForm = data.getAll('teachers');
      
      // FIXED: Ensure all teacher values are strings
      teachersArray = Array.isArray(teachersFromForm) 
        ? teachersFromForm
            .filter(t => typeof t === 'string' && t.trim())
            .map(t => t as string)
        : [];

      subjectsArray = subjectsInput.split(',').map(s => s.trim()).filter(s => s);
    } else {
      // New object data handling from our form
      className = data.className;
      classSection = data.classSection || '';
      teachersArray = data.teachers;
      subjectsArray = data.subjects;
    }

    if (!className?.trim()) {
      return { error: 'Class name is required' };
    }

    if (teachersArray.length === 0) {
      return { error: 'At least one teacher is required' };
    }

    if (subjectsArray.length === 0) {
      return { error: 'At least one subject is required' };
    }

    if (!classSection?.trim()) {
      return { error: 'Class section is required' };
    }

    // Check if class exists
    const existingClass = await db
      .select()
      .from(classes)
      .where(eq(classes.id, id))
      .limit(1);

    if (!existingClass.length) {
      return { error: 'Class not found' };
    }

    // FIXED: Check if another class has the same name (excluding current class)
    const otherClassWithSameName = await db
      .select()
      .from(classes)
      .where(
        and(
          eq(classes.className, className.trim()),
          ne(classes.id, id) // CORRECT: This excludes the current class
        )
      )
      .limit(1);

    if (otherClassWithSameName.length > 0) {
      return { error: 'A class with this name already exists' };
    }

    // FIXED: Explicitly type the update data
    const [updatedClass] = await db
      .update(classes)
      .set({
        className: className.trim(),
        teachers: teachersArray, // Now properly typed as string[]
        subjects: subjectsArray,
        classSection: classSection.trim(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(classes.id, id))
      .returning();

    revalidatePath('/classes');
    revalidatePath('/academics/classes');
    revalidatePath('/dashboard');
    revalidatePath(`/classes/${id}`);

    return {
      success: true,
      data: updatedClass,
      message: 'Class updated successfully'
    };
  } catch (error) {
    console.error('Error updating class:', error);
    return { error: 'Failed to update class. Please try again.' };
  }
}

// NEW: Function to update class subjects specifically
export async function updateClassSubjects(classId: number, subjects: string[]) {
  try {
    const [classData] = await db
      .select()
      .from(classes)
      .where(eq(classes.id, classId))
      .limit(1);

    if (!classData) {
      return { error: 'Class not found' };
    }

    const [updatedClass] = await db
      .update(classes)
      .set({
        subjects: subjects,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(classes.id, classId))
      .returning();

    revalidatePath('/classes');
    revalidatePath('/academics/classes');
    revalidatePath(`/classes/${classId}`);

    return {
      success: true,
      data: updatedClass,
      message: 'Class subjects updated successfully'
    };
  } catch (error) {
    console.error('Error updating class subjects:', error);
    return { error: 'Failed to update class subjects' };
  }
}

// NEW: Function to update class teachers specifically
export async function updateClassTeachers(classId: number, teachers: string[]) {
  try {
    const [classData] = await db
      .select()
      .from(classes)
      .where(eq(classes.id, classId))
      .limit(1);

    if (!classData) {
      return { error: 'Class not found' };
    }

    const [updatedClass] = await db
      .update(classes)
      .set({
        teachers: teachers,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(classes.id, classId))
      .returning();

    revalidatePath('/classes');
    revalidatePath('/academics/classes');
    revalidatePath(`/classes/${classId}`);

    return {
      success: true,
      data: updatedClass,
      message: 'Class teachers updated successfully'
    };
  } catch (error) {
    console.error('Error updating class teachers:', error);
    return { error: 'Failed to update class teachers' };
  }
}

export async function deleteClass(id: number) {
  try {
    const [classData] = await db
      .select()
      .from(classes)
      .where(eq(classes.id, id))
      .limit(1);

    if (!classData) {
      return { error: 'Class not found' };
    }

    // Check if there are students assigned to this class
    const classStudents = await db
      .select()
      .from(students)
      .where(eq(students.class, classData.className))
      .limit(1);

    if (classStudents.length > 0) {
      return { error: 'Cannot delete class with assigned students. Please reassign students first.' };
    }

    await db
      .delete(classes)
      .where(eq(classes.id, id));

    revalidatePath('/classes');
    revalidatePath('/academics/classes');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Class deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting class:', error);
    return { error: 'Failed to delete class. Please try again.' };
  }
}

export async function searchClasses(query: string) {
  try {
    if (!query.trim()) {
      return await getAllClasses();
    }

    const searchTerm = `%${query}%`;

    const results = await db
      .select()
      .from(classes)
      .where(
        or(
          like(classes.className, searchTerm),
          like(classes.classSection, searchTerm),
          arrayOverlaps(classes.teachers, [query]),
          arrayOverlaps(classes.subjects, [query])
        )
      )
      .orderBy(classes.className);

    return { success: true, data: results };
  } catch (error) {
    console.error('Error searching classes:', error);
    return { error: 'Failed to search classes' };
  }
}

export async function getClassesWithStudentCount() {
  try {
    const allClasses = await getAllClasses();
    if (!allClasses.success) {
      return allClasses;
    }

    const classesWithCounts = await Promise.all(
      allClasses.data.map(async (cls) => {
        const studentCountResult = await db
          .select()
          .from(students)
          .where(eq(students.class, cls.className));
        
        return {
          ...cls,
          studentCount: studentCountResult.length
        };
      })
    );

    return { success: true, data: classesWithCounts };
  } catch (error) {
    console.error('Error fetching classes with student count:', error);
    return { error: 'Failed to fetch classes with student counts' };
  }
}

export async function getClassesBySection(section: string) {
  try {
    const sectionClasses = await db
      .select()
      .from(classes)
      .where(eq(classes.classSection, section.toUpperCase()))
      .orderBy(classes.className);

    return { success: true, data: sectionClasses };
  } catch (error) {
    console.error('Error fetching classes by section:', error);
    return { error: 'Failed to fetch classes by section' };
  }
}

export async function assignTeacherToClass(className: string, teacherName: string) {
  try {
    const [classData] = await db
      .select()
      .from(classes)
      .where(eq(classes.className, className))
      .limit(1);

    if (!classData) {
      return { error: 'Class not found' };
    }

    const updatedTeachers = [...(classData.teachers || []), teacherName];
    
    const [updatedClass] = await db
      .update(classes)
      .set({
        teachers: updatedTeachers,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(classes.className, className))
      .returning();

    revalidatePath('/classes');
    revalidatePath(`/classes/${className}`);

    return {
      success: true,
      data: updatedClass,
      message: 'Teacher assigned successfully'
    };
  } catch (error) {
    console.error('Error assigning teacher:', error);
    return { error: 'Failed to assign teacher' };
  }
}

export async function removeTeacherFromClass(className: string, teacherName: string) {
  try {
    const [classData] = await db
      .select()
      .from(classes)
      .where(eq(classes.className, className))
      .limit(1);

    if (!classData) {
      return { error: 'Class not found' };
    }

    const updatedTeachers = (classData.teachers || []).filter(t => t !== teacherName);
    
    const [updatedClass] = await db
      .update(classes)
      .set({
        teachers: updatedTeachers,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(classes.className, className))
      .returning();

    revalidatePath('/classes');
    revalidatePath(`/classes/${className}`);

    return {
      success: true,
      data: updatedClass,
      message: 'Teacher removed successfully'
    };
  } catch (error) {
    console.error('Error removing teacher:', error);
    return { error: 'Failed to remove teacher' };
  }
}

export async function exportClasses(classesData: any[], format: 'json' | 'csv' | 'xlsx') {
  try {
    if (format === 'json') {
      const dataStr = JSON.stringify(classesData, null, 2);
      return {
        data: dataStr,
        filename: `classes_${Date.now()}.json`,
        mimeType: 'application/json'
      };
    } else if (format === 'csv') {
      const headers = ['ID', 'Class Name', 'Class Section', 'Teachers', 'Subjects', 'Student Count'];
      
      // Get student counts for each class
      const classesWithCounts = await Promise.all(
        classesData.map(async (cls) => {
          const studentCountResult = await db
            .select()
            .from(students)
            .where(eq(students.class, cls.className));
          
          return {
            ...cls,
            studentCount: studentCountResult.length
          };
        })
      );

      const csvData = classesWithCounts.map(cls => [
        cls.id,
        cls.className,
        cls.classSection || 'Not specified',
        cls.teachers?.join('; ') || '',
        cls.subjects?.join('; ') || '',
        cls.studentCount || 0,
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      return {
        data: csvContent,
        filename: `classes_${Date.now()}.csv`,
        mimeType: 'text/csv'
      };
    } else if (format === 'xlsx') {
      // For XLSX, you would typically use a library like xlsx
      // This is a simplified version that returns CSV for now
      const headers = ['ID', 'Class Name', 'Class Section', 'Teachers', 'Subjects', 'Student Count'];
      
      const classesWithCounts = await Promise.all(
        classesData.map(async (cls) => {
          const studentCountResult = await db
            .select()
            .from(students)
            .where(eq(students.class, cls.className));
          
          return {
            ...cls,
            studentCount: studentCountResult.length
          };
        })
      );

      const csvData = classesWithCounts.map(cls => [
        cls.id,
        cls.className,
        cls.classSection || 'Not specified',
        cls.teachers?.join('; ') || '',
        cls.subjects?.join('; ') || '',
        cls.studentCount || 0,
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      return {
        data: csvContent,
        filename: `classes_${Date.now()}.xlsx`,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

// ===== TEACHER & SUBJECT GETTERS =====

export async function getAllTeachers() {
  try {
    const teachersData = await db
      .select()
      .from(teachers)
      .orderBy(teachers.name);

    return { success: true, data: teachersData };
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return { error: 'Failed to fetch teachers' };
  }
}

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

// ===== BULK OPERATIONS =====

export async function bulkCreateClasses(classesData: Array<{
  className: string;
  classSection: string;
  teachers: string[];
  subjects: string[];
}>) {
  try {
    const results = await Promise.all(
      classesData.map(async (classData) => {
        try {
          const [newClass] = await db
            .insert(classes)
            .values({
              className: classData.className.trim(),
              classSection: classData.classSection.trim(),
              teachers: classData.teachers.filter(t => t.trim()),
              subjects: classData.subjects.filter(s => s.trim()),
            })
            .returning();
          
          return { success: true, data: newClass };
        } catch (error) {
          return { 
            success: false, 
            error: `Failed to create class ${classData.className}`,
            className: classData.className
          };
        }
      })
    );

    revalidatePath('/classes');
    revalidatePath('/academics/classes');

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return {
      success: true,
      data: {
        created: successful.length,
        failed: failed.length,
        results: results
      },
      message: `Created ${successful.length} classes, ${failed.length} failed`
    };
  } catch (error) {
    console.error('Error in bulk class creation:', error);
    return { error: 'Failed to create classes in bulk' };
  }
}