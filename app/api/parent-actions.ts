// app/parent-actions.ts
'use server'

import { db } from '@/app/api/db';
import { parents, parentStudentRelations, students } from '@lib/db/schema';
import { eq, and, or, ilike, inArray } from 'drizzle-orm';
import { sql } from 'drizzle-orm'; // Add this import
import { revalidatePath } from 'next/cache';

// Types
export type Parent = typeof parents.$inferSelect;
export type NewParent = typeof parents.$inferInsert;
export type ParentWithRelations = Parent & {
  students?: Array<{ id: number; name: string; surname: string; class?: string }>;
};

// Create a new parent
export async function createParent(parentData: NewParent) {
  try {
    const [newParent] = await db
      .insert(parents)
      .values({
        ...parentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    revalidatePath('/dashboard/users/parents');
    return newParent;
  } catch (error) {
    console.error('Error creating parent:', error);
    throw new Error('Failed to create parent');
  }
}

// Get all parents
export async function getAllParents() {
  try {
    const allParents = await db
      .select()
      .from(parents)
      .orderBy(parents.surname, parents.name);

    return allParents;
  } catch (error) {
    console.error('Error fetching parents:', error);
    throw new Error('Failed to fetch parents');
  }
}

// Get parent by ID
export async function getParentById(id: number) {
  try {
    const [parent] = await db
      .select()
      .from(parents)
      .where(eq(parents.id, id));

    if (!parent) {
      return null;
    }

    // Get associated students
    const studentRelations = await db
      .select({
        studentId: parentStudentRelations.studentId,
        relationship: parentStudentRelations.relationship,
      })
      .from(parentStudentRelations)
      .where(eq(parentStudentRelations.parentId, id));

    const studentIds = studentRelations.map(rel => rel.studentId);
    
    // Fix: Update the type to match the actual schema (class can be string | null)
    let parentStudents: Array<{ id: number; name: string; surname: string; class: string | null }> = [];

    if (studentIds.length > 0) {
      parentStudents = await db
        .select({
          id: students.id,
          name: students.name,
          surname: students.surname,
          class: students.class,
        })
        .from(students)
        .where(inArray(students.id, studentIds));
    }

    return {
      ...parent,
      students: parentStudents,
    } as ParentWithRelations;
  } catch (error) {
    console.error('Error fetching parent:', error);
    throw new Error('Failed to fetch parent');
  }
}

// Update parent
export async function updateParent(id: number, parentData: Partial<Parent>) {
  try {
    const [updatedParent] = await db
      .update(parents)
      .set({
        ...parentData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(parents.id, id))
      .returning();

    revalidatePath('/dashboard/users/parents');
    revalidatePath(`/dashboard/users/parents/${id}`);
    return updatedParent;
  } catch (error) {
    console.error('Error updating parent:', error);
    throw new Error('Failed to update parent');
  }
}

// Delete parent
export async function deleteParent(id: number) {
  try {
    // First delete parent-student relations
    await db
      .delete(parentStudentRelations)
      .where(eq(parentStudentRelations.parentId, id));

    // Then delete the parent
    const [deletedParent] = await db
      .delete(parents)
      .where(eq(parents.id, id))
      .returning();

    revalidatePath('/dashboard/users/parents');
    return deletedParent;
  } catch (error) {
    console.error('Error deleting parent:', error);
    throw new Error('Failed to delete parent');
  }
}

// Search parents
export async function searchParents(query: string) {
  try {
    const searchedParents = await db
      .select()
      .from(parents)
      .where(
        or(
          ilike(parents.name, `%${query}%`),
          ilike(parents.surname, `%${query}%`),
          ilike(parents.email, `%${query}%`),
          ilike(parents.phone, `%${query}%`)
        )
      )
      .orderBy(parents.surname, parents.name);

    return searchedParents;
  } catch (error) {
    console.error('Error searching parents:', error);
    throw new Error('Failed to search parents');
  }
}

// Get parents for dropdown/select - FIXED VERSION
export async function getParentNames() {
  try {
    const parentNames = await db
      .select({
        id: parents.id,
        name: parents.name,
        surname: parents.surname,
        phone: parents.phone,
        email: parents.email,
      })
      .from(parents)
      .where(eq(parents.status, 'active'))
      .orderBy(parents.surname, parents.name);

    // Transform the data to match the expected format
    const formattedParents = parentNames.map(parent => ({
      id: parent.id,
      label: `${parent.name} ${parent.surname}`,
      value: parent.id.toString(),
      phone: parent.phone,
      email: parent.email,
    }));

    return formattedParents;
  } catch (error) {
    console.error('Error fetching parent names:', error);
    throw new Error('Failed to fetch parent names');
  }
}

// Alternative version using SQL expression (if you prefer)
export async function getParentNamesWithSQL() {
  try {
    const parentNames = await db
      .select({
        id: parents.id,
        label: sql<string>`concat(${parents.name}, ' ', ${parents.surname})`,
        value: sql<string>`${parents.id}::text`,
        phone: parents.phone,
        email: parents.email,
      })
      .from(parents)
      .where(eq(parents.status, 'active'))
      .orderBy(parents.surname, parents.name);

    return parentNames;
  } catch (error) {
    console.error('Error fetching parent names:', error);
    throw new Error('Failed to fetch parent names');
  }
}

// Add student to parent
export async function addStudentToParent(parentId: number, studentId: number, relationship: string) {
  try {
    const [relation] = await db
      .insert(parentStudentRelations)
      .values({
        parentId,
        studentId,
        relationship,
        createdAt: new Date().toISOString(),
      })
      .returning();

    revalidatePath('/dashboard/users/parents');
    revalidatePath('/dashboard/users/students');
    return relation;
  } catch (error) {
    console.error('Error adding student to parent:', error);
    throw new Error('Failed to add student to parent');
  }
}

// Remove student from parent
export async function removeStudentFromParent(parentId: number, studentId: number) {
  try {
    const [relation] = await db
      .delete(parentStudentRelations)
      .where(
        and(
          eq(parentStudentRelations.parentId, parentId),
          eq(parentStudentRelations.studentId, studentId)
        )
      )
      .returning();

    revalidatePath('/dashboard/users/parents');
    revalidatePath('/dashboard/users/students');
    return relation;
  } catch (error) {
    console.error('Error removing student from parent:', error);
    throw new Error('Failed to remove student from parent');
  }
}

// Get parents by student ID
export async function getParentsByStudentId(studentId: number) {
  try {
    const parentRelations = await db
      .select({
        parentId: parentStudentRelations.parentId,
        relationship: parentStudentRelations.relationship,
        isPrimaryContact: parentStudentRelations.isPrimaryContact,
        emergencyContact: parentStudentRelations.emergencyContact,
        authorizedToPickup: parentStudentRelations.authorizedToPickup,
      })
      .from(parentStudentRelations)
      .where(eq(parentStudentRelations.studentId, studentId));

    if (parentRelations.length === 0) {
      return [];
    }

    const parentIds = parentRelations.map(rel => rel.parentId);
    const parentsList = await db
      .select()
      .from(parents)
      .where(inArray(parents.id, parentIds));

    // Combine parent data with relationship info
    const parentsWithRelations = parentsList.map(parent => {
      const relation = parentRelations.find(rel => rel.parentId === parent.id);
      return {
        ...parent,
        relationship: relation?.relationship,
        isPrimaryContact: relation?.isPrimaryContact,
        emergencyContact: relation?.emergencyContact,
        authorizedToPickup: relation?.authorizedToPickup,
      };
    });

    return parentsWithRelations;
  } catch (error) {
    console.error('Error fetching parents by student ID:', error);
    throw new Error('Failed to fetch parents by student ID');
  }
}