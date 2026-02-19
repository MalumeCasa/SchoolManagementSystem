'use server';

import { eq, sql } from 'drizzle-orm';
import { db } from './db';
import { students, registeredStudents } from '@lib/db/schema';
import { revalidatePath } from 'next/cache';

export type NewStudent = {
  name: string;
};

// ─── Error Parsing Helper ──────────────────────────────────────────────────────

function parseDbError(error: unknown): { message: string; field?: string; friendlyField?: string } {
  const raw = error instanceof Error ? error.message : String(error);

  const fieldLabels: Record<string, string> = {
    id_number: 'ID / Passport Number',
    email: 'Primary Email',
    phone: 'Primary Phone Number',
    name: 'First Name',
    surname: 'Surname',
    date_of_birth: 'Date of Birth',
    date_of_enrolment: 'Date of Enrolment',
    sex: 'Sex',
    religion: 'Religion',
    care_required: 'Care Required',
    marital_status: 'Marital Status',
    mother_email: "Mother's Email",
    mother_cell: "Mother's Cell Phone",
    mother_work_phone: "Mother's Work Phone",
    mother_home_phone: "Mother's Home Phone",
    mother_id_number: "Mother's ID Number",
    mother_surname: "Mother's Surname",
    mother_first_names: "Mother's First Names",
    mother_occupation: "Mother's Occupation",
    mother_employer: "Mother's Employer",
    mother_home_address: "Mother's Home Address",
    mother_work_address: "Mother's Work Address",
    father_email: "Father's Email",
    father_cell: "Father's Cell Phone",
    father_work_phone: "Father's Work Phone",
    father_home_phone: "Father's Home Phone",
    father_id_number: "Father's ID Number",
    father_surname: "Father's Surname",
    father_first_names: "Father's First Names",
    father_occupation: "Father's Occupation",
    father_employer: "Father's Employer",
    father_home_address: "Father's Home Address",
    father_work_address: "Father's Work Address",
    guardian_email: "Guardian's Email",
    guardian_cell: "Guardian's Cell Phone",
    guardian_work_phone: "Guardian's Work Phone",
    guardian_home_phone: "Guardian's Home Phone",
    guardian_id_number: "Guardian's ID Number",
    guardian_surname: "Guardian's Surname",
    guardian_first_names: "Guardian's First Names",
    guardian_occupation: "Guardian's Occupation",
    guardian_employer: "Guardian's Employer",
    guardian_home_address: "Guardian's Home Address",
    guardian_work_address: "Guardian's Work Address",
    emergency_contact_friend_name: 'Emergency Contact (Friend) Name',
    emergency_contact_friend_cell: 'Emergency Contact (Friend) Cell',
    emergency_contact_kin_name: 'Emergency Contact (Kin) Name',
    emergency_contact_kin_cell: 'Emergency Contact (Kin) Cell',
    transport_contact_1_name: 'Transport Contact 1 Name',
    transport_contact_1_phone: 'Transport Contact 1 Phone',
    transport_contact_2_name: 'Transport Contact 2 Name',
    transport_contact_2_phone: 'Transport Contact 2 Phone',
    transport_contact_3_name: 'Transport Contact 3 Name',
    transport_contact_3_phone: 'Transport Contact 3 Phone',
  };

  const toFriendly = (col: string) => fieldLabels[col] ?? col.replace(/_/g, ' ');

  const cause = (error as any)?.cause as any;
  const pgDetail: string = cause?.detail ?? cause?.message ?? '';
  const pgCode: string = cause?.code ?? '';
  const pgConstraint: string = cause?.constraint ?? '';
  const pgColumn: string = cause?.column ?? '';

  const searchIn = [pgDetail, raw].join(' ');

  // 1. Unique constraint violation
  const uniqueMatch = searchIn.match(/Key \(([^)]+)\)=\(([^)]*)\) already exists/);
  if (uniqueMatch || pgCode === '23505') {
    if (uniqueMatch) {
      const col = uniqueMatch[1];
      const val = uniqueMatch[2];
      return {
        message: `A record with this ${toFriendly(col)} already exists in the system (value: "${val}"). Please use a different value or search for the existing student by their ID number.`,
        field: col,
        friendlyField: toFriendly(col),
      };
    }
    const constraintHint = pgConstraint ? ` (constraint: "${pgConstraint}")` : '';
    return {
      message: `A duplicate value was detected${constraintHint}. Please check for existing records before submitting.`,
      field: pgConstraint || undefined,
    };
  }

  // 2. Not-null constraint violation
  const nullMatch = searchIn.match(/null value in column "([^"]+)".*violates not-null constraint/);
  if (nullMatch || pgCode === '23502') {
    const col = nullMatch?.[1] ?? pgColumn;
    return {
      message: col
        ? `The field "${toFriendly(col)}" is required and cannot be empty. Please fill it in and try again.`
        : 'A required field is missing. Please check the form for empty required fields.',
      field: col || undefined,
      friendlyField: col ? toFriendly(col) : undefined,
    };
  }

  // 3. Check constraint violation
  const checkMatch = searchIn.match(/violates check constraint "([^"]+)"/);
  if (checkMatch || pgCode === '23514') {
    const constraint = checkMatch?.[1] ?? pgConstraint;
    return {
      message: `A value in the form failed validation (constraint: "${constraint}"). Please check the highlighted field and try again.`,
      field: constraint || undefined,
    };
  }

  // 4. Foreign key violation
  const fkMatch = searchIn.match(/violates foreign key constraint "([^"]+)"/);
  if (fkMatch || pgCode === '23503') {
    const constraint = fkMatch?.[1] ?? pgConstraint;
    return {
      message: `A related record was not found (constraint: "${constraint}"). Please ensure all linked records exist before saving.`,
      field: constraint || undefined,
    };
  }

  // 5. Value too long
  const lengthMatch = searchIn.match(/value too long for type character varying\((\d+)\)/);
  if (lengthMatch || pgCode === '22001') {
    return {
      message: `One of the values you entered is too long (maximum ${lengthMatch?.[1] ?? '?'} characters). Please shorten the relevant field and try again.`,
    };
  }

  // 6. Invalid input / type mismatch
  if (pgCode === '22P02' || pgCode === '22003') {
    return {
      message: 'One of the form values has an invalid format (e.g. a number field contains text). Please review the form and try again.',
    };
  }

  // 7. Drizzle "Failed query" wrapper
  if (raw.startsWith('Failed query:')) {
    return {
      message: 'The database rejected the submission. This is likely caused by a duplicate value or an invalid field entry. Please review the form carefully and try again. If the problem persists, contact support.',
    };
  }

  // 8. Generic fallback
  return {
    message: 'An unexpected error occurred while saving. Please try again or contact support if the issue continues.',
  };
}

// ─── Duplicate Field Checkers ──────────────────────────────────────────────────

/**
 * Checks whether the given email address is already registered to another student.
 * Pass `excludeIdNumber` when editing an existing student so their own email
 * doesn't trigger a false positive.
 *
 * Returns:
 *   { exists: false }                          → email is free to use
 *   { exists: true, studentName: string }      → email is taken (includes student name)
 *   { exists: false, error: string }           → DB error (treat as non-blocking warning)
 */
export async function checkEmailExists(
  email: string,
  excludeIdNumber?: string
): Promise<{ exists: boolean; studentName?: string; error?: string }> {
  if (!email || email.trim() === '') return { exists: false };

  try {
    const student = await db.query.registeredStudents.findFirst({
      where: eq(registeredStudents.email, email.trim().toLowerCase()),
    });

    if (!student) return { exists: false };

    // If we're editing, skip the student with the same ID number
    if (excludeIdNumber && student.idNumber === excludeIdNumber) {
      return { exists: false };
    }

    return {
      exists: true,
      studentName: [student.name, student.surname].filter(Boolean).join(' ') || 'an existing student',
    };
  } catch (error) {
    console.error('checkEmailExists error:', error);
    return { exists: false, error: 'Could not verify email uniqueness.' };
  }
}

/**
 * Checks whether the given phone number is already registered to another student.
 * Pass `excludeIdNumber` when editing an existing student so their own number
 * doesn't trigger a false positive.
 *
 * Returns:
 *   { exists: false }                          → phone is free to use
 *   { exists: true, studentName: string }      → phone is taken (includes student name)
 *   { exists: false, error: string }           → DB error (treat as non-blocking warning)
 */
export async function checkPhoneExists(
  phone: string,
  excludeIdNumber?: string
): Promise<{ exists: boolean; studentName?: string; error?: string }> {
  if (!phone || phone.trim() === '') return { exists: false };

  try {
    const student = await db.query.registeredStudents.findFirst({
      where: eq(registeredStudents.phone, phone.trim()),
    });

    if (!student) return { exists: false };

    if (excludeIdNumber && student.idNumber === excludeIdNumber) {
      return { exists: false };
    }

    return {
      exists: true,
      studentName: [student.name, student.surname].filter(Boolean).join(' ') || 'an existing student',
    };
  } catch (error) {
    console.error('checkPhoneExists error:', error);
    return { exists: false, error: 'Could not verify phone uniqueness.' };
  }
}

// ─── CREATE ────────────────────────────────────────────────────────────────────

export async function createStudent(formData: FormData) {
  const name = formData.get('name') as string;
  const surname = formData.get('surname') as string;
  const email = formData.get('email') as string;
  try {
    await db.insert(students).values({ name, surname, email });
    revalidatePath('/');
    return { success: true, message: 'Student created successfully' };
  } catch (error) {
    console.error('Failed to create student:', error);
    return { error: 'Failed to create student' };
  }
}

export async function createStudentWithDetails(formData: FormData) {
  const name = formData.get('name') as string;
  const surname = formData.get('surname') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const attendance = formData.get('attendance') as string;
  const studentClass = formData.get('studentClass') as string;

  try {
    await db.insert(students).values({
      name, surname, email, phone, address, attendance,
      class: studentClass
    });
    revalidatePath('/');
    return { success: true, message: 'Student created successfully' };
  } catch (error) {
    console.error('Failed to create student:', error);
    return { error: 'Failed to create student' };
  }
}

// ─── Register Student ──────────────────────────────────────────────────────────

export async function registerStudent(formData: FormData) {
  try {
    const authorizedToBring = formData.get('authorizedToBring')?.toString().split(',').filter(Boolean) || [];
    const authorizedToCollect = formData.get('authorizedToCollect')?.toString().split(',').filter(Boolean) || [];
    const livesWith = formData.get('livesWith')?.toString().split(',').filter(Boolean) || [];
    const homeLanguage = formData.get('homeLanguage')?.toString().split(',').filter(Boolean) || [];

    const name = formData.get('name') as string;
    const surname = formData.get('surname') as string;
    const preferredName = formData.get('preferredName') as string;

    // Handle empty date strings by converting to null
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const dateOfEnrolment = formData.get('dateOfEnrolment') as string;

    const idNumber = formData.get('idNumber') as string;
    const sex = formData.get('sex') as string;
    const address = formData.get('address') as string;
    const previousSchool = formData.get('previousSchool') as string;
    const intendedPrimarySchool = formData.get('intendedPrimarySchool') as string;
    const careRequired = formData.get('careRequired') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const religion = formData.get('religion') as string;
    const ageAtEnrolment = parseInt(formData.get('ageAtEnrolment') as string) || 0;

    // Get status from form data - this is key for updates
    const status = formData.get('status') as string;

    const numberOfChildrenInFamily = parseInt(formData.get('numberOfChildrenInFamily') as string) || 0;
    const positionInFamily = parseInt(formData.get('positionInFamily') as string) || 0;

    const medicalConsent1 = formData.get('medical_consent1') as string;
    const medicalConsent1Father = formData.get('consent1_father') === 'on';
    const medicalConsent1Mother = formData.get('consent1_mother') === 'on';
    const medicalConsent1Guardian = formData.get('consent1_guardian') === 'on';

    const medicalConsent2 = formData.get('medical_consent2') as string;
    const medicalConsent2Father = formData.get('consent2_father') === 'on';
    const medicalConsent2Mother = formData.get('consent2_mother') === 'on';
    const medicalConsent2Guardian = formData.get('consent2_guardian') === 'on';

    const maritalStatus = formData.get('maritalStatus') as string;

    const emergencyContactFriendName = formData.get('emergencyContactFriendName') as string;
    const emergencyContactFriendRelationship = formData.get('emergencyContactFriendRelationship') as string;
    const emergencyContactFriendAddress = formData.get('emergencyContactFriendAddress') as string;
    const emergencyContactFriendWorkPhone = formData.get('emergencyContactFriendWorkPhone') as string;
    const emergencyContactFriendHomePhone = formData.get('emergencyContactFriendHomePhone') as string;
    const emergencyContactFriendCell = formData.get('emergencyContactFriendCell') as string;
    const emergencyContactKinName = formData.get('emergencyContactKinName') as string;
    const emergencyContactKinRelationship = formData.get('emergencyContactKinRelationship') as string;
    const emergencyContactKinAddress = formData.get('emergencyContactKinAddress') as string;
    const emergencyContactKinWorkPhone = formData.get('emergencyContactKinWorkPhone') as string;
    const emergencyContactKinHomePhone = formData.get('emergencyContactKinHomePhone') as string;
    const emergencyContactKinCell = formData.get('emergencyContactKinCell') as string;

    const transportContact1Name = formData.get('transportContact1Name') as string;
    const transportContact1Phone = formData.get('transportContact1Phone') as string;
    const transportContact2Name = formData.get('transportContact2Name') as string;
    const transportContact2Phone = formData.get('transportContact2Phone') as string;
    const transportContact3Name = formData.get('transportContact3Name') as string;
    const transportContact3Phone = formData.get('transportContact3Phone') as string;

    const specialInstructions = formData.get('specialInstructions') as string;

    const motherTitle = formData.get('motherTitle') as string;
    const motherSurname = formData.get('motherSurname') as string;
    const motherFirstNames = formData.get('motherFirstNames') as string;
    const motherIdNumber = formData.get('motherIdNumber') as string;
    const motherOccupation = formData.get('motherOccupation') as string;
    const motherEmployer = formData.get('motherEmployer') as string;
    const motherWorkPhone = formData.get('motherWorkPhone') as string;
    const motherHomePhone = formData.get('motherHomePhone') as string;
    const motherCell = formData.get('motherCell') as string;
    const motherEmail = formData.get('motherEmail') as string;
    const motherHomeAddress = formData.get('motherHomeAddress') as string;
    const motherWorkAddress = formData.get('motherWorkAddress') as string;

    const fatherTitle = formData.get('fatherTitle') as string;
    const fatherSurname = formData.get('fatherSurname') as string;
    const fatherFirstNames = formData.get('fatherFirstNames') as string;
    const fatherIdNumber = formData.get('fatherIdNumber') as string;
    const fatherOccupation = formData.get('fatherOccupation') as string;
    const fatherEmployer = formData.get('fatherEmployer') as string;
    const fatherWorkPhone = formData.get('fatherWorkPhone') as string;
    const fatherHomePhone = formData.get('fatherHomePhone') as string;
    const fatherCell = formData.get('fatherCell') as string;
    const fatherEmail = formData.get('fatherEmail') as string;
    const fatherHomeAddress = formData.get('fatherHomeAddress') as string;
    const fatherWorkAddress = formData.get('fatherWorkAddress') as string;

    const guardianTitle = formData.get('guardianTitle') as string;
    const guardianSurname = formData.get('guardianSurname') as string;
    const guardianFirstNames = formData.get('guardianFirstNames') as string;
    const guardianIdNumber = formData.get('guardianIdNumber') as string;
    const guardianOccupation = formData.get('guardianOccupation') as string;
    const guardianEmployer = formData.get('guardianEmployer') as string;
    const guardianWorkPhone = formData.get('guardianWorkPhone') as string;
    const guardianHomePhone = formData.get('guardianHomePhone') as string;
    const guardianCell = formData.get('guardianCell') as string;
    const guardianEmail = formData.get('guardianEmail') as string;
    const guardianHomeAddress = formData.get('guardianHomeAddress') as string;
    const guardianWorkAddress = formData.get('guardianWorkAddress') as string;

    const consent1FatherSignature = formData.get('consent1_fatherSignature') as string;
    const consent1FatherDate = formData.get('consent1_fatherDate') as string;
    const consent1MotherSignature = formData.get('consent1_motherSignature') as string;
    const consent1MotherDate = formData.get('consent1_motherDate') as string;
    const consent1GuardianSignature = formData.get('consent1_guardianSignature') as string;
    const consent1GuardianDate = formData.get('consent1_guardianDate') as string;

    const consent2FatherSignature = formData.get('consent2_fatherSignature') as string;
    const consent2FatherDate = formData.get('consent2_fatherDate') as string;
    const consent2MotherSignature = formData.get('consent2_motherSignature') as string;
    const consent2MotherDate = formData.get('consent2_motherDate') as string;
    const consent2GuardianSignature = formData.get('consent2_guardianSignature') as string;
    const consent2GuardianDate = formData.get('consent2_guardianDate') as string;

    const medicalConditions = (formData.get('medicalConditions') as string)?.split(',').map(item => item.trim()).filter(Boolean) || [];

    // Check if student already exists by ID number
    const existingStudent = await getRegisteredStudentByIdNumber(idNumber);

    // ── Pre-submission duplicate checks for email & phone ─────────────────────
    if (!existingStudent) {
      if (email && email.trim() !== '') {
        const emailCheck = await checkEmailExists(email);
        if (emailCheck.exists) {
          return {
            error: `This email address (${email}) is already registered to ${emailCheck.studentName}. Please use a different email or search for the existing student by their ID number.`,
            field: 'email',
            friendlyField: 'Primary Email',
          };
        }
      }

      if (phone && phone.trim() !== '') {
        const phoneCheck = await checkPhoneExists(phone);
        if (phoneCheck.exists) {
          return {
            error: `This phone number (${phone}) is already registered to ${phoneCheck.studentName}. Please use a different number or search for the existing student by their ID number.`,
            field: 'phone',
            friendlyField: 'Primary Phone Number',
          };
        }
      }
    }

    // Helper function to handle empty strings for date fields
    const handleDateField = (dateStr: string | null): string | null => {
      if (!dateStr || dateStr.trim() === '') return null;
      return dateStr;
    };

    // Base student data object with null checks for dates
    const studentData: any = {
      name,
      surname,
      preferredName: preferredName || null,
      dateOfBirth: handleDateField(dateOfBirth),
      idNumber,
      sex: sex || null,
      address: address || null,
      email: email || null,
      phone: phone || null,
      homeLanguage: homeLanguage.length > 0 ? homeLanguage : null,
      religion: religion || null,
      dateOfEnrolment: handleDateField(dateOfEnrolment),
      ageAtEnrolment: ageAtEnrolment || null,
      previousSchool: previousSchool || null,
      intendedPrimarySchool: intendedPrimarySchool || null,
      careRequired: careRequired || null,
      numberOfChildrenInFamily: numberOfChildrenInFamily || null,
      positionInFamily: positionInFamily || null,
      authorizedToBring: authorizedToBring.length > 0 ? authorizedToBring : null,
      authorizedToCollect: authorizedToCollect.length > 0 ? authorizedToCollect : null,
      medicalConsent1: medicalConsent1 || null,
      medicalConsent1Father: medicalConsent1Father || false,
      medicalConsent1Mother: medicalConsent1Mother || false,
      medicalConsent1Guardian: medicalConsent1Guardian || false,
      medicalConsent2: medicalConsent2 || null,
      medicalConsent2Father: medicalConsent2Father || false,
      medicalConsent2Mother: medicalConsent2Mother || false,
      medicalConsent2Guardian: medicalConsent2Guardian || false,
      maritalStatus: maritalStatus || null,
      livesWith: livesWith.length > 0 ? livesWith : null,
      emergencyContactFriendName: emergencyContactFriendName || null,
      emergencyContactFriendRelationship: emergencyContactFriendRelationship || null,
      emergencyContactFriendAddress: emergencyContactFriendAddress || null,
      emergencyContactFriendWorkPhone: emergencyContactFriendWorkPhone || null,
      emergencyContactFriendHomePhone: emergencyContactFriendHomePhone || null,
      emergencyContactFriendCell: emergencyContactFriendCell || null,
      emergencyContactKinName: emergencyContactKinName || null,
      emergencyContactKinRelationship: emergencyContactKinRelationship || null,
      emergencyContactKinAddress: emergencyContactKinAddress || null,
      emergencyContactKinWorkPhone: emergencyContactKinWorkPhone || null,
      emergencyContactKinHomePhone: emergencyContactKinHomePhone || null,
      emergencyContactKinCell: emergencyContactKinCell || null,
      transportContact1Name: transportContact1Name || null,
      transportContact1Phone: transportContact1Phone || null,
      transportContact2Name: transportContact2Name || null,
      transportContact2Phone: transportContact2Phone || null,
      transportContact3Name: transportContact3Name || null,
      transportContact3Phone: transportContact3Phone || null,
      specialInstructions: specialInstructions || null,
      motherTitle: motherTitle || null,
      motherSurname: motherSurname || null,
      motherFirstNames: motherFirstNames || null,
      motherIdNumber: motherIdNumber || null,
      motherOccupation: motherOccupation || null,
      motherEmployer: motherEmployer || null,
      motherWorkPhone: motherWorkPhone || null,
      motherHomePhone: motherHomePhone || null,
      motherCell: motherCell || null,
      motherEmail: motherEmail || null,
      motherHomeAddress: motherHomeAddress || null,
      motherWorkAddress: motherWorkAddress || null,
      fatherTitle: fatherTitle || null,
      fatherSurname: fatherSurname || null,
      fatherFirstNames: fatherFirstNames || null,
      fatherIdNumber: fatherIdNumber || null,
      fatherOccupation: fatherOccupation || null,
      fatherEmployer: fatherEmployer || null,
      fatherWorkPhone: fatherWorkPhone || null,
      fatherHomePhone: fatherHomePhone || null,
      fatherCell: fatherCell || null,
      fatherEmail: fatherEmail || null,
      fatherHomeAddress: fatherHomeAddress || null,
      fatherWorkAddress: fatherWorkAddress || null,
      guardianTitle: guardianTitle || null,
      guardianSurname: guardianSurname || null,
      guardianFirstNames: guardianFirstNames || null,
      guardianIdNumber: guardianIdNumber || null,
      guardianOccupation: guardianOccupation || null,
      guardianEmployer: guardianEmployer || null,
      guardianWorkPhone: guardianWorkPhone || null,
      guardianHomePhone: guardianHomePhone || null,
      guardianCell: guardianCell || null,
      guardianEmail: guardianEmail || null,
      guardianHomeAddress: guardianHomeAddress || null,
      guardianWorkAddress: guardianWorkAddress || null,
      motherFinancialSignature: consent1MotherSignature || consent2MotherSignature || null,
      motherFinancialDate: handleDateField(consent1MotherDate || consent2MotherDate),
      fatherFinancialSignature: consent1FatherSignature || consent2FatherSignature || null,
      fatherFinancialDate: handleDateField(consent1FatherDate || consent2FatherDate),
      medicalConditions: medicalConditions.length > 0 ? medicalConditions : null,
      updatedAt: new Date().toISOString()
    };

    // Handle status based on whether this is a new student or an update
    if (existingStudent) {
      // For updates: use the status from form data if provided, otherwise keep existing
      if (status) {
        studentData.status = status;
      }
    } else {
      // For new students: default to 'pending'
      studentData.status = 'pending';
      // Set default consent values for new students
      studentData.popiConsent = false;
      studentData.financialAgreedTerms = false;
      studentData.financialAgreedLiability = false;
      studentData.financialAgreedCancellation = false;
    }

    if (existingStudent) {
      const updateData: any = {};

      // Only include fields that have values (not null or undefined)
      Object.keys(studentData).forEach((key) => {
        const value = (studentData as any)[key];
        if (value !== null && value !== undefined) {
          // Convert empty strings to null for date fields
          const dateFields = ['dateOfBirth', 'dateOfEnrolment', 'motherFinancialDate', 'fatherFinancialDate'];
          if (dateFields.includes(key) && value === '') {
            updateData[key] = null;
          } else if (value !== '') {
            updateData[key] = value;
          }
        }
      });

      // Always include updated_at
      updateData.updated_at = new Date();

      const updatedStudent = await db.update(registeredStudents)
        .set(updateData)
        .where(eq(registeredStudents.idNumber, idNumber))
        .returning();

      revalidatePath('/');
      return {
        success: true,
        message: 'Student updated successfully',
        action: 'updated',
        student: updatedStudent[0]
      };
    } else {
      const newStudent = await db.insert(registeredStudents)
        .values(studentData)
        .returning();

      revalidatePath('/');
      return {
        success: true,
        message: 'Student registered successfully',
        action: 'created',
        student: newStudent[0]
      };
    }
  } catch (error) {
    console.error('Failed to register/update student:', error);
    const parsed = parseDbError(error);
    return {
      error: parsed.message,
      field: parsed.field,
      friendlyField: parsed.friendlyField,
    };
  }
}

// ─── Register Student Basic ────────────────────────────────────────────────────

export async function registerStudentBasic(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const surname = formData.get('surname') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const dateOfEnrolment = formData.get('dateOfEnrolment') as string;
    const address = formData.get('address') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;

    await db.insert(registeredStudents).values({
      name,
      surname,
      dateOfBirth,
      dateOfEnrolment,
      address,
      email,
      phone,
      status: 'pending'
    });

    revalidatePath('/');
    return { success: true, message: 'Student registered successfully' };
  } catch (error) {
    console.error('Failed to register student:', error);
    return { error: 'Failed to register student' };
  }
}

// ─── READ ──────────────────────────────────────────────────────────────────────

export async function getRegisteredStudents() {
  try {
    const registeredStudentsList = await db.select().from(registeredStudents);
    return registeredStudentsList;
  } catch (error) {
    console.error('Failed to get registered students:', error);
    return [];
  }
}

export async function getRegisteredStudentById(id: number) {
  try {
    const student = await db.query.registeredStudents.findFirst({
      where: eq(registeredStudents.id, Number(id)),
    });
    return student || null;
  } catch (error) {
    console.error('Failed to get registered student by ID:', error);
    return null;
  }
}

export async function getStudents() {
  try {
    const studentsList = await db.select().from(students);
    return studentsList;
  } catch (error) {
    console.error('Failed to get students:', error);
    return [];
  }
}

export async function getStudentNames() {
  try {
    const studentNames = await db.select({ name: students.name }).from(students);
    return studentNames.map((student) => student.name);
  } catch (error) {
    console.error('Failed to get student names:', error);
    return [];
  }
}

export async function getStudentDetailsEmails() {
  try {
    const studentDetails = await db.select({ surname: students.surname, email: students.email }).from(students);
    return studentDetails;
  } catch (error) {
    console.error('Failed to get student details:', error);
    return [];
  }
}

export async function getStudentById(id: number) {
  try {
    const student = await db.query.students.findFirst({
      where: eq(students.id, Number(id)),
    });
    return student || null;
  } catch (error) {
    console.error('Failed to get student by ID:', error);
    return null;
  }
}

export async function getRegisteredStudentByIdNumber(idNumber: string) {
  try {
    const student = await db.query.registeredStudents.findFirst({
      where: eq(registeredStudents.idNumber, idNumber),
    });
    return student || null;
  } catch (error) {
    console.error('Failed to get registered student by ID number:', error);
    return null;
  }
}

// ─── UPDATE ────────────────────────────────────────────────────────────────────

export async function updateStudentConsent(formData: FormData) {
  try {
    const idNumber = formData.get('idNumber') as string;

    if (idNumber) {
      const existingStudent = await db.query.registeredStudents.findFirst({
        where: eq(registeredStudents.idNumber, idNumber),
      });

      if (!existingStudent) {
        return { error: 'Student not found with the provided ID number' };
      }

      const updateData: any = { updatedAt: new Date().toISOString() };

      const popiConsent = formData.get('popiConsent');
      if (popiConsent !== null) updateData.popiConsent = popiConsent === 'on' || popiConsent === 'true';

      const indemnityAgreement = formData.get('indemnityAgreement');
      if (indemnityAgreement !== null) updateData.indemnityAgreement = indemnityAgreement === 'on' || indemnityAgreement === 'true';

      const financialAgreedTerms = formData.get('financialAgreedTerms');
      if (financialAgreedTerms !== null) updateData.financialAgreedTerms = financialAgreedTerms === 'on' || financialAgreedTerms === 'true';

      const financialAgreedLiability = formData.get('financialAgreedLiability');
      if (financialAgreedLiability !== null) updateData.financialAgreedLiability = financialAgreedLiability === 'on' || financialAgreedLiability === 'true';

      const financialAgreedCancellation = formData.get('financialAgreedCancellation');
      if (financialAgreedCancellation !== null) updateData.financialAgreedCancellation = financialAgreedCancellation === 'on' || financialAgreedCancellation === 'true';

      const textFields = [
        'motherPopiSignature', 'motherPopiDate',
        'fatherPopiSignature', 'fatherPopiDate',
        'surname', 'name', 'dateOfBirth', 'signatory1FullName', 'signatory1Signature',
        'signatory1IDNumber', 'signatory1Relation', 'signatory1CellNumber',
        'signatory1Email', 'signatory1PhysicalAddress', 'signatory1DateSigned',
        'signatory2FullName', 'signatory2IDNumber', 'signatory2Relation',
        'signatory2CellNumber', 'signatory2Email', 'signatory2PhysicalAddress',
        'signatory2DateSigned', 'signatory2Signature', 'witnessName', 'witnessSignature',
        'signedAt', 'agreementDate', 'motherFinancialDate', 'fatherFinancialDate',
        'monthlyAmount', 'paymentDate'
      ];

      textFields.forEach(field => {
        const value = formData.get(field) as string;
        if (value !== null && value !== undefined && value !== '') updateData[field] = value;
      });

      const updatedStudent = await db.update(registeredStudents)
        .set(updateData)
        .where(eq(registeredStudents.idNumber, idNumber))
        .returning();

      revalidatePath('/');
      return { success: true, message: 'Consent agreement updated successfully', student: updatedStudent[0] };
    } else {
      return { error: 'ID number is required for update' };
    }
  } catch (error) {
    console.error('Failed to update student consent agreement:', error);
    const parsed = parseDbError(error);
    return { error: parsed.message, field: parsed.field, friendlyField: parsed.friendlyField };
  }
}

export async function updateRegisteredStudent(id: number, formData: FormData) {
  try {
    const idNumber = formData.get('id_number') as string;

    if (idNumber) {
      const existingStudent = await db.query.registeredStudents.findFirst({
        where: eq(registeredStudents.idNumber, idNumber),
      });

      if (!existingStudent) {
        return { error: 'Student not found with the provided ID number' };
      }

      const updateData: any = { updatedAt: new Date().toISOString() };

      const fields = [
        'name', 'surname', 'preferredName', 'dateOfBirth', 'sex', 'address',
        'email', 'phone', 'homeLanguage', 'religion', 'previousSchool',
        'intendedPrimarySchool', 'careRequired', 'dateOfEnrolment', 'ageAtEnrolment',
        'numberOfChildrenInFamily', 'positionInFamily', 'maritalStatus', 'livesWith',
        'emergencyContactFriendName', 'emergencyContactFriendRelationship',
        'emergencyContactFriendAddress', 'emergencyContactFriendWorkPhone',
        'emergencyContactFriendHomePhone', 'emergencyContactFriendCell',
        'emergencyContactKinName', 'emergencyContactKinRelationship',
        'emergencyContactKinAddress', 'emergencyContactKinWorkPhone',
        'emergencyContactKinHomePhone', 'emergencyContactKinCell',
        'transportContact1Name', 'transportContact1Phone',
        'transportContact2Name', 'transportContact2Phone',
        'transportContact3Name', 'transportContact3Phone',
        'specialInstructions', 'familyDoctor', 'doctorPhone',
        'childhoodSicknesses', 'lifeThreateningAllergies', 'otherAllergies',
        'majorOperations', 'behaviorProblems', 'speechHearingProblems',
        'birthComplications', 'familyMedicalHistory', 'status'
      ];

      fields.forEach(field => {
        const value = formData.get(field) as string;
        if (value !== null && value !== undefined && value !== '') updateData[field] = value;
      });

      const arrayFields = ['authorizedToBring', 'authorizedToCollect', 'medicalConditions'];
      arrayFields.forEach(field => {
        const value = formData.get(field) as string;
        if (value) updateData[field] = value.split(',').map(item => item.trim()).filter(Boolean);
      });

      const numberFields = ['numberOfChildrenInFamily', 'positionInFamily', 'ageAtEnrolment'];
      numberFields.forEach(field => {
        const value = formData.get(field) as string;
        if (value) updateData[field] = parseInt(value) || 0;
      });

      const booleanFields = [
        'medicalConsent1Father', 'medicalConsent1Mother', 'medicalConsent1Guardian',
        'medicalConsent2Father', 'medicalConsent2Mother', 'medicalConsent2Guardian',
        'regularMedications', 'immunisationUpToDate'
      ];
      booleanFields.forEach(field => {
        const value = formData.get(field);
        if (value !== null) updateData[field] = value === 'on' || value === 'true';
      });

      const medicalConsent1 = formData.get('medical_consent1') as string;
      const medicalConsent2 = formData.get('medical_consent2') as string;
      if (medicalConsent1) updateData.medicalConsent1 = medicalConsent1;
      if (medicalConsent2) updateData.medicalConsent2 = medicalConsent2;

      const parentFields = [
        'motherTitle', 'motherSurname', 'motherFirstNames', 'motherIdNumber',
        'motherOccupation', 'motherEmployer', 'motherWorkPhone', 'motherHomePhone',
        'motherCell', 'motherEmail', 'motherHomeAddress', 'motherWorkAddress',
        'fatherTitle', 'fatherSurname', 'fatherFirstNames', 'fatherIdNumber',
        'fatherOccupation', 'fatherEmployer', 'fatherWorkPhone', 'fatherHomePhone',
        'fatherCell', 'fatherEmail', 'fatherHomeAddress', 'fatherWorkAddress',
        'guardianTitle', 'guardianSurname', 'guardianFirstNames', 'guardianIdNumber',
        'guardianOccupation', 'guardianEmployer', 'guardianWorkPhone', 'guardianHomePhone',
        'guardianCell', 'guardianEmail', 'guardianHomeAddress', 'guardianWorkAddress'
      ];

      parentFields.forEach(field => {
        const value = formData.get(field) as string;
        if (value !== null && value !== undefined && value !== '') updateData[field] = value;
      });

      const updatedStudent = await db.update(registeredStudents)
        .set(updateData)
        .where(eq(registeredStudents.idNumber, idNumber))
        .returning();

      revalidatePath('/');
      return { success: true, message: 'Student updated successfully', student: updatedStudent[0] };
    } else {
      return { error: 'ID number is required for update' };
    }
  } catch (error) {
    console.error('Failed to update registered student:', error);
    const parsed = parseDbError(error);
    return { error: parsed.message, field: parsed.field, friendlyField: parsed.friendlyField };
  }
}

export async function updateRegisteredStudentMedicalForm(formData: FormData) {
  try {
    const idNumber = formData.get('id_number') as string;

    if (idNumber) {
      const existingStudent = await db.query.registeredStudents.findFirst({
        where: eq(registeredStudents.idNumber, idNumber),
      });

      if (!existingStudent) {
        return { error: 'Student not found with the provided ID number' };
      }

      const updateData: any = { updatedAt: new Date().toISOString() };

      const textFields = [
        'familyDoctor', 'doctorPhone', 'childhoodSicknesses',
        'lifeThreateningAllergies', 'otherAllergies', 'majorOperations',
        'behaviorProblems', 'speechHearingProblems', 'birthComplications',
        'familyMedicalHistory', 'otherConditionsDetails', 'regularMedicationsDetails'
      ];

      textFields.forEach(field => {
        const value = formData.get(field) as string;
        if (value !== null && value !== undefined && value !== '') updateData[field] = value;
      });

      const booleanFields = [
        'immunisationUpToDate', 'diabetes', 'asthma', 'epilepsy',
        'cardiacMurmur', 'otherConditions', 'regularMedications'
      ];

      booleanFields.forEach(field => {
        const value = formData.get(field);
        updateData[field] = value !== null && value !== undefined;
      });

      const updatedStudent = await db.update(registeredStudents)
        .set(updateData)
        .where(eq(registeredStudents.idNumber, idNumber))
        .returning();

      revalidatePath('/');
      return { success: true, message: 'Medical form updated successfully', student: updatedStudent[0] };
    } else {
      return { error: 'ID number is required for update' };
    }
  } catch (error) {
    console.error('Failed to update registered student medical form:', error);
    const parsed = parseDbError(error);
    return { error: parsed.message, field: parsed.field, friendlyField: parsed.friendlyField };
  }
}

export async function updateStudent(id: number, formData: FormData) {
  const updatedName = formData.get('name') as string;
  try {
    const updatedStudent = await db.update(students)
      .set({ name: updatedName })
      .where(eq(students.id, id))
      .returning();

    console.log('Updated student:', updatedStudent);
    revalidatePath('/');
    return { success: true, message: 'Student updated successfully' };
  } catch (error) {
    console.error('Failed to update student:', error);
    return { error: 'Failed to update student' };
  }
}

export async function updateStudentWithDetails(id: number, formData: FormData) {
  const updatedName = formData.get('name') as string;
  const updatedSurname = formData.get('surname') as string;
  const updatedEmail = formData.get('email') as string;
  const updatedPhone = formData.get('phone') as string;
  const updatedAddress = formData.get('address') as string;
  const updatedAttendance = formData.get('attendance') as string;
  try {
    const updatedStudent = await db.update(students)
      .set({
        name: updatedName,
        surname: updatedSurname,
        email: updatedEmail,
        phone: updatedPhone,
        address: updatedAddress,
        attendance: updatedAttendance
      })
      .where(eq(students.id, id))
      .returning();

    console.log('Updated student:', updatedStudent);
    revalidatePath('/');
    return { success: true, message: 'Student updated successfully' };
  } catch (error) {
    console.error('Failed to update student:', error);
    return { error: 'Failed to update student' };
  }
}

// ─── DELETE ────────────────────────────────────────────────────────────────────

export async function deleteRegisteredStudent(id: number) {
  try {
    await db.delete(registeredStudents).where(eq(registeredStudents.id, id));
    revalidatePath('/');
    return { success: true, message: 'Registered student deleted successfully' };
  } catch (error) {
    console.error('Failed to delete registered student:', error);
    return { error: 'Failed to delete registered student' };
  }
}

export async function deleteStudent(id: number) {
  try {
    await db.delete(students).where(eq(students.id, id));
    revalidatePath('/');
    return { success: true, message: 'Student deleted successfully' };
  } catch (error) {
    console.error('Failed to delete student:', error);
    return { error: 'Failed to delete student' };
  }
}

// ─── EXPORT ────────────────────────────────────────────────────────────────────

export async function exportStudents(studentsData: any[], format: 'json' | 'csv' | 'xlsx') {
  try {
    if (format === 'json') {
      const dataStr = JSON.stringify(studentsData, null, 2);
      return { data: dataStr, filename: `students_${Date.now()}.json`, mimeType: 'application/json' };
    } else if (format === 'csv' || format === 'xlsx') {
      const headers = ['ID', 'Name', 'Surname', 'Email', 'Phone', 'Address', 'Class'];
      const csvData = studentsData.map(student => [
        student.id, student.name, student.surname, student.email,
        student.phone || 'N/A', student.address || 'N/A', student.class || 'N/A'
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const isXlsx = format === 'xlsx';
      return {
        data: csvContent,
        filename: `students_${Date.now()}.${format}`,
        mimeType: isXlsx
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv'
      };
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}