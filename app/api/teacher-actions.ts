'use server';

import { db } from './db';
import { teachers } from '@lib/db/schema';
import { eq, like, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// READ
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

export async function getTeacherById(id: number) {
  try {
    const [teacher] = await db
      .select()
      .from(teachers)
      .where(eq(teachers.id, id))
      .limit(1);

    if (!teacher) {
      return { error: 'Teacher not found' };
    }

    return { success: true, data: teacher };
  } catch (error) {
    console.error('Error fetching teacher:', error);
    return { error: 'Failed to fetch teacher' };
  }
}

// CREATE
// CREATE
export async function createTeacher(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const surname = formData.get('surname') as string;
    const role = formData.get('role') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const subjectsInput = formData.get('subjectsInput') as string;
    const experience = parseInt(formData.get('experience') as string);
    const qualification = formData.get('qualification') as string;
    const staffId = parseInt(formData.get('staffId') as string); // Add staffId

    if (!name?.trim() || !surname?.trim() || !email?.trim() || !staffId) {
      return { error: 'Name, surname, email, and staff ID are required' };
    }

    // Process subjects from comma-separated string to array
    const subjects = subjectsInput 
      ? subjectsInput.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];

    const [newTeacher] = await db
      .insert(teachers)
      .values({
        name: name.trim(),
        surname: surname.trim(),
        role: role?.trim() || 'Teacher',
        email: email.trim(),
        phone: phone?.trim() || '',
        subjects: subjects,
        experience: experience || 0,
        qualification: qualification?.trim() || '',
        staffId: staffId, // Add staffId
      })
      .returning();

    revalidatePath('/dashboard/users/staff');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: newTeacher,
      message: 'Teacher created successfully'
    };
  } catch (error) {
    console.error('Error creating teacher:', error);
    return { error: 'Failed to create teacher' };
  }
}

// UPDATE
export async function updateTeacher(id: number, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const surname = formData.get('surname') as string;
    const role = formData.get('role') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const subjectsInput = formData.get('subjectsInput') as string;
    const experience = parseInt(formData.get('experience') as string);
    const qualification = formData.get('qualification') as string;
    const staffId = parseInt(formData.get('staffId') as string); // Add staffId

    if (!name?.trim() || !surname?.trim() || !email?.trim() || !staffId) {
      return { error: 'Name, surname, email, and staff ID are required' };
    }

    // Process subjects from comma-separated string to array
    const subjects = subjectsInput 
      ? subjectsInput.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];

    const [updatedTeacher] = await db
      .update(teachers)
      .set({
        name: name.trim(),
        surname: surname.trim(),
        role: role?.trim() || 'Teacher',
        email: email.trim(),
        phone: phone?.trim() || '',
        subjects: subjects,
        experience: experience || 0,
        qualification: qualification?.trim() || '',
        staffId: staffId, // Add staffId
      })
      .where(eq(teachers.id, id))
      .returning();

    revalidatePath('/dashboard/users/staff');
    revalidatePath(`/dashboard/users/staff/${id}`);

    return {
      success: true,
      data: updatedTeacher,
      message: 'Teacher updated successfully'
    };
  } catch (error) {
    console.error('Error updating teacher:', error);
    return { error: 'Failed to update teacher' };
  }
}

// DELETE
export async function deleteTeacher(id: number) {
  try {
    const [teacher] = await db
      .select()
      .from(teachers)
      .where(eq(teachers.id, id))
      .limit(1);

    if (!teacher) {
      return { error: 'Teacher not found' };
    }

    await db
      .delete(teachers)
      .where(eq(teachers.id, id));

    revalidatePath('/dashboard/users/staff');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Teacher deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return { error: 'Failed to delete teacher' };
  }
}

// SEARCH
export async function searchTeachers(query: string) {
  try {
    if (!query.trim()) {
      return await getAllTeachers();
    }

    const searchTerm = `%${query}%`;

    const results = await db
      .select()
      .from(teachers)
      .where(
        or(
          like(teachers.name, searchTerm),
          like(teachers.surname, searchTerm),
          like(teachers.email, searchTerm),
          like(teachers.role, searchTerm)
        )
      )
      .orderBy(teachers.name);

    return { success: true, data: results };
  } catch (error) {
    console.error('Error searching teachers:', error);
    return { error: 'Failed to search teachers' };
  }
}