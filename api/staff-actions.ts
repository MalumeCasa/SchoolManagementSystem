'use server';

import { db } from './db';
import { staff, staffAttendance, staffLeave, staffSalary } from '@lib/db/schema';
import { eq, like, or, and, gte, lte, desc, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { Staff, InsertStaff, StaffRole, EmploymentType, Department } from './db/staff-type';

// READ Operations
export async function getAllStaff() {
  try {
    const staffData = await db
      .select()
      .from(staff)
      .orderBy(staff.name);

    return { success: true, data: staffData };
  } catch (error) {
    console.error('Error fetching staff:', error);
    return { error: 'Failed to fetch staff' };
  }
}

export async function getStaffById(id: string) {
  try {
    // Check if it looks like a staff ID (e.g., TCH001, ADM001)
    const isStaffId = /^[A-Z]{3}\d{3}$/.test(id);
    
    if (isStaffId) {
      // Query by staff_id column
      const [staffMember] = await db
        .select()
        .from(staff)
        .where(eq(staff.staffId, id))
        .limit(1);
        
      if (!staffMember) {
        return { error: 'Staff member not found' };
      }
      
      return { success: true, data: staffMember };
    } else {
      // Try to parse as numeric ID
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return { error: 'Invalid staff ID format' };
      }
      
      const [staffMember] = await db
        .select()
        .from(staff)
        .where(eq(staff.id, numericId))
        .limit(1);

      if (!staffMember) {
        return { error: 'Staff member not found' };
      }

      return { success: true, data: staffMember };
    }
  } catch (error) {
    console.error('Error fetching staff member:', error);
    return { error: 'Failed to fetch staff member' };
  }
}

export async function getStaffByRole(role: StaffRole) {
  try {
    const staffData = await db
      .select()
      .from(staff)
      .where(eq(staff.role, role))
      .orderBy(staff.name);

    return { success: true, data: staffData };
  } catch (error) {
    console.error('Error fetching staff by role:', error);
    return { error: 'Failed to fetch staff by role' };
  }
}

export async function getStaffByDepartment(department: Department) {
  try {
    const staffData = await db
      .select()
      .from(staff)
      .where(eq(staff.department, department))
      .orderBy(staff.name);

    return { success: true, data: staffData };
  } catch (error) {
    console.error('Error fetching staff by department:', error);
    return { error: 'Failed to fetch staff by department' };
  }
}

export async function getActiveStaff() {
  try {
    const staffData = await db
      .select()
      .from(staff)
      .where(eq(staff.isActive, true))
      .orderBy(staff.name);

    return { success: true, data: staffData };
  } catch (error) {
    console.error('Error fetching active staff:', error);
    return { error: 'Failed to fetch active staff' };
  }
}

// Function to generate staff ID (same logic as frontend)
async function generateStaffId(position: string): Promise<string> {
  const prefixMap: Record<string, string> = {
      'principal': 'ADM',
      'vice principal': 'ADM',
      'head of department': 'HOD',
      'teacher': 'TCH',
      'administrator': 'ADM',
      'support staff': 'SUP',
      'accountant': 'ACC',
      'librarian': 'LIB'
  };

  // Find the best matching prefix
  let prefix = 'EMP';
  const lowerPosition = position.toLowerCase();
  
  for (const [key, value] of Object.entries(prefixMap)) {
      if (lowerPosition.includes(key)) {
          prefix = value;
          break;
      }
  }

  // Get existing staff IDs to find the next available number
  const existingStaff = await db.select({ staffId: staff.staffId }).from(staff);
  const existingIds = existingStaff.map(s => s.staffId);

  let number = 1;
  let staffId = `${prefix}${number.toString().padStart(3, '0')}`;
  
  // Find the next available number
  while (existingIds.includes(staffId)) {
      number++;
      staffId = `${prefix}${number.toString().padStart(3, '0')}`;
      
      if (number > 999) {
          staffId = `${prefix}${Math.random().toString().slice(2, 5)}`;
          break;
      }
  }

  return staffId;
}

// CREATE Operations
export async function createStaff(formData: FormData) {
  try {
    // Personal Information
    const name = formData.get('name') as string;
    const surname = formData.get('surname') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const gender = formData.get('gender') as string;
    const emergencyContact = formData.get('emergencyContact') as string;
    const emergencyPhone = formData.get('emergencyPhone') as string;

    // Employment Information
    const employmentType = formData.get('employmentType') as EmploymentType;
    const position = formData.get('position') as string;
    const department = formData.get('department') as Department;
    const hireDate = formData.get('hireDate') as string;
    const role = formData.get('role') as StaffRole;

    // Professional Information
    const qualification = formData.get('qualification') as string;
    const specialization = formData.get('specialization') as string;
    const experience = parseInt(formData.get('experience') as string) || 0;
    const certificationsInput = formData.get('certifications') as string;
    const subjectsInput = formData.get('subjects') as string;

    // Generate staff ID automatically
    const staffId = await generateStaffId(position);

    // Process arrays from comma-separated strings
    const certifications = certificationsInput 
      ? certificationsInput.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];
    
    const subjects = subjectsInput 
      ? subjectsInput.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];

    // Validation
    if (!name?.trim() || !surname?.trim() || !email?.trim()) {
      return { error: 'Name, surname, and email are required' };
    }

    if (!position?.trim() || !department || !employmentType || !role) {
      return { error: 'Position, department, employment type, and role are required' };
    }

    const [newStaff] = await db
      .insert(staff)
      .values({
        staffId,
        name: name.trim(),
        surname: surname.trim(),
        email: email.trim(),
        phone: phone?.trim() || '',
        address: address?.trim(),
        dateOfBirth: dateOfBirth?.trim(),
        gender: gender?.trim(),
        emergencyContact: emergencyContact?.trim(),
        emergencyPhone: emergencyPhone?.trim(),
        employmentType,
        position: position.trim(),
        department,
        hireDate: hireDate?.trim() || new Date().toISOString().split('T')[0],
        role,
        qualification: qualification?.trim() || '',
        specialization: specialization?.trim(),
        experience,
        certifications,
        subjects,
        isActive: true,
      })
      .returning();

    revalidatePath('/dashboard/users/staff');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: newStaff,
      message: 'Staff member created successfully'
    };
  } catch (error) {
    console.error('Error creating staff:', error);
    return { error: 'Failed to create staff member' };
  }
}

// UPDATE Operations
export async function updateStaff(id: number, formData: FormData) {
  try {
    // Personal Information
    const name = formData.get('name') as string;
    const surname = formData.get('surname') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const gender = formData.get('gender') as string;
    const emergencyContact = formData.get('emergencyContact') as string;
    const emergencyPhone = formData.get('emergencyPhone') as string;

    // Employment Information
    const employmentType = formData.get('employmentType') as EmploymentType;
    const position = formData.get('position') as string;
    const department = formData.get('department') as Department;
    const employmentStatus = formData.get('employmentStatus') as string;
    const role = formData.get('role') as StaffRole;

    // Professional Information
    const qualification = formData.get('qualification') as string;
    const specialization = formData.get('specialization') as string;
    const experience = parseInt(formData.get('experience') as string) || 0;
    const certificationsInput = formData.get('certifications') as string;
    const subjectsInput = formData.get('subjects') as string;

    // Process arrays from comma-separated strings
    const certifications = certificationsInput 
      ? certificationsInput.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];
    
    const subjects = subjectsInput 
      ? subjectsInput.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];

    // Validation
    if (!name?.trim() || !surname?.trim() || !email?.trim()) {
      return { error: 'Name, surname, and email are required' };
    }

    const [updatedStaff] = await db
      .update(staff)
      .set({
        name: name.trim(),
        surname: surname.trim(),
        email: email.trim(),
        phone: phone?.trim() || '',
        address: address?.trim(),
        dateOfBirth: dateOfBirth?.trim(),
        gender: gender?.trim(),
        emergencyContact: emergencyContact?.trim(),
        emergencyPhone: emergencyPhone?.trim(),
        employmentType,
        position: position.trim(),
        department,
        employmentStatus: employmentStatus?.trim() || 'active',
        role,
        qualification: qualification?.trim() || '',
        specialization: specialization?.trim(),
        experience,
        certifications,
        subjects,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(staff.id, id))
      .returning();

    revalidatePath('/dashboard/users/staff');
    revalidatePath(`/dashboard/users/staff/${id}`);

    return {
      success: true,
      data: updatedStaff,
      message: 'Staff member updated successfully'
    };
  } catch (error) {
    console.error('Error updating staff:', error);
    return { error: 'Failed to update staff member' };
  }
}

// DELETE Operations
export async function deleteStaff(id: number) {
  try {
    const [staffMember] = await db
      .select()
      .from(staff)
      .where(eq(staff.id, id))
      .limit(1);

    if (!staffMember) {
      return { error: 'Staff member not found' };
    }

    await db
      .delete(staff)
      .where(eq(staff.id, id));

    revalidatePath('/dashboard/users/staff');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Staff member deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting staff:', error);
    return { error: 'Failed to delete staff member' };
  }
}

export async function deactivateStaff(id: number) {
  try {
    const [staffMember] = await db
      .update(staff)
      .set({ 
        isActive: false,
        employmentStatus: 'terminated',
        terminationDate: new Date().toISOString().split('T')[0]
      })
      .where(eq(staff.id, id))
      .returning();

    revalidatePath('/dashboard/users/staff');

    return {
      success: true,
      data: staffMember,
      message: 'Staff member deactivated successfully'
    };
  } catch (error) {
    console.error('Error deactivating staff:', error);
    return { error: 'Failed to deactivate staff member' };
  }
}

// SEARCH Operations
export async function searchStaff(query: string) {
  try {
    if (!query.trim()) {
      return await getAllStaff();
    }

    const searchTerm = `%${query}%`;

    const results = await db
      .select()
      .from(staff)
      .where(
        or(
          like(staff.name, searchTerm),
          like(staff.surname, searchTerm),
          like(staff.email, searchTerm),
          like(staff.position, searchTerm),
          like(staff.staffId, searchTerm)
        )
      )
      .orderBy(staff.name);

    return { success: true, data: results };
  } catch (error) {
    console.error('Error searching staff:', error);
    return { error: 'Failed to search staff' };
  }
}

// ATTENDANCE Operations
export async function recordStaffAttendance(formData: FormData) {
  try {
    const staffId = parseInt(formData.get('staffId') as string);
    const date = formData.get('date') as string;
    const status = formData.get('status') as string;
    const checkIn = formData.get('checkIn') as string;
    const checkOut = formData.get('checkOut') as string;
    const notes = formData.get('notes') as string;

    const [attendance] = await db
      .insert(staffAttendance)
      .values({
        staffId,
        date,
        status,
        checkIn,
        checkOut,
        notes: notes?.trim(),
      })
      .returning();

    revalidatePath('/dashboard/users/staff/attendance');

    return {
      success: true,
      data: attendance,
      message: 'Attendance recorded successfully'
    };
  } catch (error) {
    console.error('Error recording attendance:', error);
    return { error: 'Failed to record attendance' };
  }
}

export async function getStaffAttendance(staffId: number, startDate?: string, endDate?: string) {
  try {
    const attendance = await db
      .select()
      .from(staffAttendance)
      .where(
        startDate && endDate 
          ? and(
              eq(staffAttendance.staffId, staffId),
              gte(staffAttendance.date, startDate),
              lte(staffAttendance.date, endDate)
            )
          : eq(staffAttendance.staffId, staffId)
      )
      .orderBy(desc(staffAttendance.date));

    return { success: true, data: attendance };
  } catch (error) {
    console.error('Error fetching staff attendance:', error);
    return { error: 'Failed to fetch staff attendance' };
  }
}

// LEAVE Operations
export async function requestLeave(formData: FormData) {
  try {
    const staffId = parseInt(formData.get('staffId') as string);
    const leaveType = formData.get('leaveType') as string;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const reason = formData.get('reason') as string;

    const [leaveRequest] = await db
      .insert(staffLeave)
      .values({
        staffId,
        leaveType,
        startDate,
        endDate,
        reason: reason?.trim(),
        status: 'pending',
      })
      .returning();

    revalidatePath('/dashboard/users/staff/leave');

    return {
      success: true,
      data: leaveRequest,
      message: 'Leave request submitted successfully'
    };
  } catch (error) {
    console.error('Error requesting leave:', error);
    return { error: 'Failed to submit leave request' };
  }
}

export async function updateLeaveStatus(leaveId: number, status: string, approvedBy: number) {
  try {
    const [updatedLeave] = await db
      .update(staffLeave)
      .set({ 
        status,
        approvedBy 
      })
      .where(eq(staffLeave.id, leaveId))
      .returning();

    revalidatePath('/dashboard/users/staff/leave');

    return {
      success: true,
      data: updatedLeave,
      message: `Leave request ${status} successfully`
    };
  } catch (error) {
    console.error('Error updating leave status:', error);
    return { error: 'Failed to update leave status' };
  }
}

// UTILITY Functions
export async function getStaffStatistics() {
  try {
    const totalStaff = await db.select().from(staff);
    const activeStaff = totalStaff.filter(s => s.isActive);
    const byDepartment = totalStaff.reduce((acc, staff) => {
      acc[staff.department] = (acc[staff.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byRole = totalStaff.reduce((acc, staff) => {
      acc[staff.role] = (acc[staff.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      success: true,
      data: {
        total: totalStaff.length,
        active: activeStaff.length,
        inactive: totalStaff.length - activeStaff.length,
        byDepartment,
        byRole
      }
    };
  } catch (error) {
    console.error('Error fetching staff statistics:', error);
    return { error: 'Failed to fetch staff statistics' };
  }
}

// Add this function to your staff-actions.ts
export async function getStaffMemberById(id: number) {
  try {
    const [staffMember] = await db
      .select({
        name: staff.name,
        surname: staff.surname,
        email: staff.email,
        position: staff.position,
        department: staff.department,
        role: staff.role,
        isActive: staff.isActive
      })
      .from(staff)
      .where(eq(staff.id, id))
      .limit(1);

    if (!staffMember) {
      return { 
        error: `Staff member with ID ${id} not found`,
        data: null 
      };
    }

    if (!staffMember.isActive) {
      return { 
        error: `Staff member ${staffMember.name} is not active`,
        data: null 
      };
    }

    return {
      success: true,
      data: {
        name: `${staffMember.name} ${staffMember.surname}`,
        email: staffMember.email,
        img: "/images/user/user-03.png",
        position: staffMember.position,
        department: staffMember.department,
        role: staffMember.role
      }
    };
  } catch (error) {
    console.error('Error fetching staff member:', error);
    return { 
      error: 'Failed to fetch staff information',
      data: null 
    };
  }
}

// In staff-actions.ts, after creating staff
export async function createStaffWithUser(formData: FormData) {
  try {
    // First create staff member using existing createStaff function
    const staffResult = await createStaff(formData);
    
    if (staffResult.error) {
      return staffResult;
    }

    // Create user account for the staff member
    const email = formData.get('email') as string;
    const password = formData.get('password') as string || 'defaultPassword123';
    
    // You might want to generate a random password and email it to the user
    // For now, we'll use a default password that should be changed on first login
    
    const registerFormData = new FormData();
    registerFormData.append('email', email);
    registerFormData.append('password', password);
    registerFormData.append('userType', 'staff');
    registerFormData.append('referenceId', staffResult.data?.id.toString() || '');

    // Call register function from auth-actions
    // You'll need to import it or call it directly
    
    return {
      ...staffResult,
      message: 'Staff member created with user account. Default password: defaultPassword123'
    };
  } catch (error) {
    console.error('Error creating staff with user:', error);
    return { error: 'Failed to create staff member with user account' };
  }
}