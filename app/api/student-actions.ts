'use server';

import { eq } from 'drizzle-orm';
import { db } from './db';
import { students, registeredStudents } from '@lib/db/schema';
import { revalidatePath } from 'next/cache';

export type NewStudent = {
  name: string;
};

// CREATE
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

// Register Student - UPDATED VERSION (Updates if student exists)
export async function registerStudent(formData: FormData) {
  try {
    // Parse array fields from comma-separated strings
    const authorizedToBring = formData.get('authorizedToBring')?.toString().split(',').filter(Boolean) || [];
    const authorizedToCollect = formData.get('authorizedToCollect')?.toString().split(',').filter(Boolean) || [];
    const livesWith = formData.get('livesWith')?.toString().split(',').filter(Boolean) || [];
    const homeLanguage = formData.get('homeLanguage')?.toString().split(',').filter(Boolean) || [];

    // Basic student information
    const name = formData.get('name') as string;
    const surname = formData.get('surname') as string;
    const preferredName = formData.get('preferredName') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const idNumber = formData.get('idNumber') as string;
    const sex = formData.get('sex') as string;
    const address = formData.get('address') as string;
    const previousSchool = formData.get('previousSchool') as string;
    const intendedPrimarySchool = formData.get('intendedPrimarySchool') as string;
    const careRequired = formData.get('careRequired') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const religion = formData.get('religion') as string;
    const dateOfEnrolment = formData.get('dateOfEnrolment') as string;
    const ageAtEnrolment = parseInt(formData.get('ageAtEnrolment') as string) || 0;

    // Family information
    const numberOfChildrenInFamily = parseInt(formData.get('numberOfChildrenInFamily') as string) || 0;
    const positionInFamily = parseInt(formData.get('positionInFamily') as string) || 0;

    // Medical consent data
    const medicalConsent1 = formData.get('medical_consent1') as string;
    const medicalConsent1Father = formData.get('consent1_father') === 'on';
    const medicalConsent1Mother = formData.get('consent1_mother') === 'on';
    const medicalConsent1Guardian = formData.get('consent1_guardian') === 'on';

    const medicalConsent2 = formData.get('medical_consent2') as string;
    const medicalConsent2Father = formData.get('consent2_father') === 'on';
    const medicalConsent2Mother = formData.get('consent2_mother') === 'on';
    const medicalConsent2Guardian = formData.get('consent2_guardian') === 'on';

    const maritalStatus = formData.get('maritalStatus') as string;

    // Emergency contacts
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

    // Transport information
    const transportContact1Name = formData.get('transportContact1Name') as string;
    const transportContact1Phone = formData.get('transportContact1Phone') as string;
    const transportContact2Name = formData.get('transportContact2Name') as string;
    const transportContact2Phone = formData.get('transportContact2Phone') as string;
    const transportContact3Name = formData.get('transportContact3Name') as string;
    const transportContact3Phone = formData.get('transportContact3Phone') as string;

    const specialInstructions = formData.get('specialInstructions') as string;

    // Parent/Guardian information
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

    //Guardian information
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

    // Signature data from medical consent
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

    // Arrays (convert from comma-separated strings or handle appropriately)
    const medicalConditions = (formData.get('medicalConditions') as string)?.split(',').map(item => item.trim()).filter(Boolean) || [];

    // Check if student already exists by ID number
    const existingStudent = await getRegisteredStudentByIdNumber(idNumber);

    // Prepare student data
    const studentData = {
      // Basic information
      name,
      surname,
      preferredName,
      dateOfBirth,
      idNumber,
      sex,
      address,
      email,
      phone,
      homeLanguage,
      religion,
      dateOfEnrolment,
      ageAtEnrolment,
      previousSchool,
      intendedPrimarySchool,
      careRequired,

      // Family information
      numberOfChildrenInFamily,
      positionInFamily,
      authorizedToBring,
      authorizedToCollect,

      // Medical consent
      medicalConsent1,
      medicalConsent1Father,
      medicalConsent1Mother,
      medicalConsent1Guardian,
      medicalConsent2,
      medicalConsent2Father,
      medicalConsent2Mother,
      medicalConsent2Guardian,
      maritalStatus,
      livesWith,

      // Emergency contacts
      emergencyContactFriendName,
      emergencyContactFriendRelationship,
      emergencyContactFriendAddress,
      emergencyContactFriendWorkPhone,
      emergencyContactFriendHomePhone,
      emergencyContactFriendCell,
      emergencyContactKinName,
      emergencyContactKinRelationship,
      emergencyContactKinAddress,
      emergencyContactKinWorkPhone,
      emergencyContactKinHomePhone,
      emergencyContactKinCell,

      // Transport information
      transportContact1Name,
      transportContact1Phone,
      transportContact2Name,
      transportContact2Phone,
      transportContact3Name,
      transportContact3Phone,

      specialInstructions,

      // Mother information
      motherTitle,
      motherSurname,
      motherFirstNames,
      motherIdNumber,
      motherOccupation,
      motherEmployer,
      motherWorkPhone,
      motherHomePhone,
      motherCell,
      motherEmail,
      motherHomeAddress,
      motherWorkAddress,

      // Father information
      fatherTitle,
      fatherSurname,
      fatherFirstNames,
      fatherIdNumber,
      fatherOccupation,
      fatherEmployer,
      fatherWorkPhone,
      fatherHomePhone,
      fatherCell,
      fatherEmail,
      fatherHomeAddress,
      fatherWorkAddress,

      //Guardian information 
      guardianTitle,
      guardianSurname,
      guardianFirstNames,
      guardianIdNumber,
      guardianOccupation,
      guardianEmployer,
      guardianWorkPhone,
      guardianHomePhone,
      guardianCell,
      guardianEmail,
      guardianHomeAddress,
      guardianWorkAddress,

      // Medical consent signatures
      motherFinancialSignature: consent1MotherSignature || consent2MotherSignature,
      motherFinancialDate: consent1MotherDate || consent2MotherDate,
      fatherFinancialSignature: consent1FatherSignature || consent2FatherSignature,
      fatherFinancialDate: consent1FatherDate || consent2FatherDate,

      // Arrays
      medicalConditions,

      // Default values for optional fields
      status: 'pending',
      popiConsent: false,
      financialAgreedTerms: false,
      financialAgreedLiability: false,
      financialAgreedCancellation: false,
      updatedAt: new Date().toISOString()
    };

    if (existingStudent) {
      // Create update data with only non-empty values
      const updateData: any = {
        updated_at: new Date(),
      };

      // Only include fields that have values
      Object.keys(studentData).forEach((key) => {
        const value = (studentData as any)[key];
        if (value !== null && value !== undefined && value !== '') {
          updateData[key] = value;
        }
      });

      // Update existing student
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
      // Insert new student
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
    return {
      error: 'Failed to register/update student: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
}

// Alternative register function for simpler forms
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

// READ
// Get registered students
export async function getRegisteredStudents() {
  try {
    const registeredStudentsList = await db.select().from(registeredStudents);
    return registeredStudentsList;
  } catch (error) {
    console.error('Failed to get registered students:', error);
    return [];
  }
}

// Get registered student by ID
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

//get student by ID number
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

// UPDATE
// UPDATE Consent Agreement
export async function updateStudentConsent(formData: FormData) {
  try {
    const idNumber = formData.get('idNumber') as string;

    // First, check if student exists with the provided ID number
    if (idNumber) {
      const existingStudent = await db.query.registeredStudents.findFirst({
        where: eq(registeredStudents.idNumber, idNumber),
      });

      if (!existingStudent) {
        return { error: 'Student not found with the provided ID number' };
      }

      // Prepare update data
      const updateData: any = {
        updatedAt: new Date().toISOString()
      };

      // Handle POPI consent fields
      const popiConsent = formData.get('popiConsent');
      if (popiConsent !== null) {
        updateData.popiConsent = popiConsent === 'on' || popiConsent === 'true';
      }

      const indemnityAgreement = formData.get('indemnityAgreement');
      if (indemnityAgreement !== null) {
        updateData.indemnityAgreement = indemnityAgreement === 'on' || indemnityAgreement === 'true';
      }

      const financialAgreedTerms = formData.get('financialAgreedTerms');
      if (financialAgreedTerms !== null) {
        updateData.financialAgreedTerms = financialAgreedTerms === 'on' || financialAgreedTerms === 'true';
      }

      const financialAgreedLiability = formData.get('financialAgreedLiability');
      if (financialAgreedLiability !== null) {
        updateData.financialAgreedLiability = financialAgreedLiability === 'on' || financialAgreedLiability === 'true';
      }

      const financialAgreedCancellation = formData.get('financialAgreedCancellation');
      if (financialAgreedCancellation !== null) {
        updateData.financialAgreedCancellation = financialAgreedCancellation === 'on' || financialAgreedCancellation === 'true';
      }



      // Add text fields only if they are provided in the form
      const textFields = [
        'motherPopiSignature', 'motherPopiDate',
        'fatherPopiSignature', 'fatherPopiDate',
        'surname', 'name', 'dateOfBirth', 'signatory1FullName', 'signatory1Signature',
        'signatory1IDNumber', 'signatory1Relation', 'signatory1CellNumber',
        'signatory1Email', 'signatory1PhysicalAddress', 'signatory1DateSigned',
        'signatory2FullName', 'signatory2IDNumber', 'signatory2Relation',
        'signatory2CellNumber', 'signatory2Email', 'signatory2PhysicalAddress',
        'signatory2DateSigned', 'signatory2Signature', 'witnessName', 'witnessSignature',
        'signedAt', 'agreementDate',

        'motherFinancialDate', 'fatherFinancialDate', 'monthlyAmount',
        'paymentDate'
      ];

      textFields.forEach(field => {
        const value = formData.get(field) as string;
        if (value !== null && value !== undefined && value !== '') {
          updateData[field] = value;
        }
      });

      // Debug log to see what's being submitted
      console.log('Consent form data received:', {
        idNumber,
        popiConsent: formData.get('popiConsent'),
        processedPopiConsent: updateData.popiConsent,
        indemnityAgreement: formData.get('indemnityAgreement'),
        processedIndemnityAgreement: updateData.indemnityAgreement,
        financialAgreedTerms: formData.get('financialAgreedTerms'),
        processedFinancialAgreedTerms: updateData.financialAgreedTerms,
        financialAsgreedLiability: formData.get('financialAgreedLiability'),
        processedfinancialAgreedLiability: updateData.financialAgreedLiability,
        financialAgreedCancellation: formData.get('financialAgreedCancellation'),
        processedfinancialAgreedCancellation: updateData.financialAgreedCancellation,
        textFields: textFields.map(field => ({
          field,
          value: formData.get(field)
        })),
      });

      // Update the student
      const updatedStudent = await db.update(registeredStudents)
        .set(updateData)
        .where(eq(registeredStudents.idNumber, idNumber))
        .returning();

      revalidatePath('/');
      return {
        success: true,
        message: 'Consent agreement updated successfully',
        student: updatedStudent[0]
      };
    } else {
      return { error: 'ID number is required for update' };
    }
  } catch (error) {
    console.error('Failed to update student consent agreement:', error);
    return {
      error: 'Failed to update consent agreement: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
}

// Update registered student - Full
export async function updateRegisteredStudent(id: number, formData: FormData) {
  try {
    const idNumber = formData.get('id_number') as string;

    // First, check if student exists with the provided ID number
    if (idNumber) {
      const existingStudent = await db.query.registeredStudents.findFirst({
        where: eq(registeredStudents.idNumber, idNumber),
      });

      if (!existingStudent) {
        return { error: 'Student not found with the provided ID number' };
      }

      // Prepare update data
      const updateData: any = {
        updatedAt: new Date().toISOString()
      };

      // Add fields only if they are provided in the form
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
        if (value !== null && value !== undefined && value !== '') {
          updateData[field] = value;
        }
      });

      // Handle array fields
      const arrayFields = ['authorizedToBring', 'authorizedToCollect', 'medicalConditions'];
      arrayFields.forEach(field => {
        const value = formData.get(field) as string;
        if (value) {
          updateData[field] = value.split(',').map(item => item.trim()).filter(Boolean);
        }
      });

      // Handle number fields
      const numberFields = ['numberOfChildrenInFamily', 'positionInFamily', 'ageAtEnrolment'];
      numberFields.forEach(field => {
        const value = formData.get(field) as string;
        if (value) {
          updateData[field] = parseInt(value) || 0;
        }
      });

      // Handle boolean fields
      const booleanFields = [
        'medicalConsent1Father', 'medicalConsent1Mother', 'medicalConsent1Guardian',
        'medicalConsent2Father', 'medicalConsent2Mother', 'medicalConsent2Guardian',
        'regularMedications', 'immunisationUpToDate'
      ];
      booleanFields.forEach(field => {
        const value = formData.get(field);
        if (value !== null) {
          updateData[field] = value === 'on' || value === 'true';
        }
      });

      // Handle medical consent answers
      const medicalConsent1 = formData.get('medical_consent1') as string;
      const medicalConsent2 = formData.get('medical_consent2') as string;
      if (medicalConsent1) updateData.medicalConsent1 = medicalConsent1;
      if (medicalConsent2) updateData.medicalConsent2 = medicalConsent2;

      // Handle parent/guardian information
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
        if (value !== null && value !== undefined && value !== '') {
          updateData[field] = value;
        }
      });

      // Update the student
      const updatedStudent = await db.update(registeredStudents)
        .set(updateData)
        .where(eq(registeredStudents.idNumber, idNumber))
        .returning();

      revalidatePath('/');
      return {
        success: true,
        message: 'Student updated successfully',
        student: updatedStudent[0]
      };
    } else {
      return { error: 'ID number is required for update' };
    }
  } catch (error) {
    console.error('Failed to update registered student:', error);
    return { error: 'Failed to update student: ' + (error instanceof Error ? error.message : 'Unknown error') };
  }
}

// UPDATE registered student - Medical Form (FIXED VERSION)
export async function updateRegisteredStudentMedicalForm(formData: FormData) {
  try {
    const idNumber = formData.get('id_number') as string;

    // First, check if student exists with the provided ID number
    if (idNumber) {
      const existingStudent = await db.query.registeredStudents.findFirst({
        where: eq(registeredStudents.idNumber, idNumber),
      });

      if (!existingStudent) {
        return { error: 'Student not found with the provided ID number' };
      }

      // Prepare update data
      const updateData: any = {
        updatedAt: new Date().toISOString()
      };

      // Add text fields only if they are provided in the form
      const textFields = [
        'familyDoctor', 'doctorPhone', 'childhoodSicknesses',
        'lifeThreateningAllergies', 'otherAllergies', 'majorOperations',
        'behaviorProblems', 'speechHearingProblems', 'birthComplications',
        'familyMedicalHistory', 'otherConditionsDetails', 'regularMedicationsDetails'
      ];

      textFields.forEach(field => {
        const value = formData.get(field) as string;
        if (value !== null && value !== undefined && value !== '') {
          updateData[field] = value;
        }
      });

      // Handle boolean fields - FIXED VERSION
      const booleanFields = [
        'immunisationUpToDate',
        'diabetes',
        'asthma',
        'epilepsy',
        'cardiacMurmur',
        'otherConditions',
        'regularMedications'
      ];

      // For each boolean field, check if it exists in formData
      booleanFields.forEach(field => {
        const value = formData.get(field);
        // If the checkbox is checked, it will be present in formData with value 'on'
        // If unchecked, it will be null/undefined
        updateData[field] = value !== null && value !== undefined;
      });

      // Debug log to see what's being submitted
      console.log('Form data received:', {
        idNumber,
        booleanFields: booleanFields.map(field => ({
          field,
          value: formData.get(field),
          processed: updateData[field]
        })),
        textFields: textFields.map(field => ({
          field,
          value: formData.get(field)
        }))
      });

      // Update the student
      const updatedStudent = await db.update(registeredStudents)
        .set(updateData)
        .where(eq(registeredStudents.idNumber, idNumber))
        .returning();

      revalidatePath('/');
      return {
        success: true,
        message: 'Medical form updated successfully',
        student: updatedStudent[0]
      };
    } else {
      return { error: 'ID number is required for update' };
    }
  } catch (error) {
    console.error('Failed to update registered student medical form:', error);
    return { error: 'Failed to update medical form: ' + (error instanceof Error ? error.message : 'Unknown error') };
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

// DELETE

// DELETE registered student
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

export async function exportStudents(studentsData: any[], format: 'json' | 'csv' | 'xlsx') {
  try {
    if (format === 'json') {
      const dataStr = JSON.stringify(studentsData, null, 2);
      return {
        data: dataStr,
        filename: `students_${Date.now()}.json`,
        mimeType: 'application/json'
      };
    } else if (format === 'csv') {
      const headers = ['ID', 'Name', 'Surname', 'Email', 'Phone', 'Address', 'Class'];
      const csvData = studentsData.map(student => [
        student.id,
        student.name,
        student.surname,
        student.email,
        student.phone || 'N/A',
        student.address || 'N/A',
        student.class || 'N/A'
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      return {
        data: csvContent,
        filename: `students_${Date.now()}.csv`,
        mimeType: 'text/csv'
      };
    } else if (format === 'xlsx') {
      const headers = ['ID', 'Name', 'Surname', 'Email', 'Phone', 'Address', 'Class'];
      const csvData = studentsData.map(student => [
        student.id,
        student.name,
        student.surname,
        student.email,
        student.phone || 'N/A',
        student.address || 'N/A',
        student.class || 'N/A'
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      return {
        data: csvContent,
        filename: `students_${Date.now()}.xlsx`,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}