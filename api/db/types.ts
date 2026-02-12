// types.ts
export interface ClassActivity {
    id: number;
    title: string;
    date: string;
    className?: string;
  }
  
  export interface Student {
    id: number;
    name: string;
    surname: string;
    phone?: string;
    address?: string;
    attendance?: string;
    class?: string;
    email?: string;
  }
  
  export interface Teacher {
    id: number;
    name: string;
    surname: string;
    role: string;
    email: string;
    phone: string;
    subjects: string[];
    experience: number;
    qualification: string;
    staffId: number;
    classRole?: string;
  }
  
  export interface Staff {
    id: number;
    staffId: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    address?: string;
    dateOfBirth?: string;
    gender?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    employmentType: string;
    position: string;
    department: string;
    hireDate: string;
    terminationDate?: string;
    employmentStatus?: string;
    qualification: string;
    specialization?: string;
    experience: number;
    certifications?: string[];
    subjects?: string[];
    role: string;
    permissions?: any; // JSONB field
    accessLevel?: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface StaffAttendance {
    id: number;
    staffId: number;
    date: string;
    status: string;
    checkIn?: string;
    checkOut?: string;
    notes?: string;
  }
  
  export interface StaffLeave {
    id: number;
    staffId: number;
    leaveType: string;
    startDate: string;
    endDate: string;
    status?: string;
    reason?: string;
    approvedBy?: number;
    createdAt?: string;
  }
  
  export interface StaffSalary {
    id: number;
    staffId: number;
    baseSalary: number;
    allowances?: any; // JSONB field
    deductions?: any; // JSONB field
    effectiveDate: string;
    paymentFrequency?: string;
  }
  
  export interface SubjectTeacher {
    id: number;
    subjectId: number;
    teacherId: number;
    teacherName: string;
    isPrimary?: boolean;
  }
  
  export interface ParentStudentRelation {
    id: number;
    parentId: number;
    studentId: number;
    relationship: string;
    isPrimaryContact?: boolean;
    emergencyContact?: boolean;
    authorizedToPickup?: boolean;
    createdAt?: string;
  }
  
  export interface Parent {
    id: number;
    title?: string;
    name: string;
    surname: string;
    idNumber?: string;
    dateOfBirth?: string;
    gender?: string;
    email?: string;
    phone: string;
    alternatePhone?: string;
    homeAddress?: string;
    postalAddress?: string;
    workAddress?: string;
    occupation?: string;
    employer?: string;
    workPhone?: string;
    relationshipToStudent: string;
    isPrimaryContact?: boolean;
    emergencyContact?: boolean;
    authorizedToPickup?: boolean;
    responsibleForFees?: boolean;
    feePaymentMethod?: string;
    bankAccountDetails?: any; // JSONB field
    medicalConsent?: boolean;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface Subject {
    id: number;
    name: string;
    className: string;
    teacher: string;
    teacherIds: number[];
    teacherNames: string[];
    schedule: string;
    duration: string;
    topics: string[];
    assessments: any; // JSONB field
    classSection: string;
    updatedAt?: string;
    createdAt?: string;
  }
  
  export interface RegisteredStudent {
    id: number;
    surname: string;
    firstNames: string;
    preferredName?: string;
    dateOfBirth: string;
    idNumber?: string;
    sex?: string;
    homeLanguage?: string;
    religion?: string;
    numberOfChildrenInFamily?: number;
    positionInFamily?: number;
    authorizedToBring?: string[];
    authorizedToCollect?: string[];
    previousSchool?: string;
    intendedPrimarySchool?: string;
    careRequired?: string;
    dateOfEnrolment: string;
    ageAtEnrolment?: number;
    motherContact?: string;
    fatherContact?: string;
    emergencyContactFriendName?: string;
    emergencyContactFriendRelationship?: string;
    emergencyContactFriendAddress?: string;
    emergencyContactFriendWorkPhone?: string;
    emergencyContactFriendHomePhone?: string;
    emergencyContactFriendCell?: string;
    emergencyContactKinName?: string;
    emergencyContactKinRelationship?: string;
    emergencyContactKinAddress?: string;
    emergencyContactKinWorkPhone?: string;
    emergencyContactKinHomePhone?: string;
    emergencyContactKinCell?: string;
    transportContact1Name?: string;
    transportContact1Phone?: string;
    transportContact2Name?: string;
    transportContact2Phone?: string;
    transportContact3Name?: string;
    transportContact3Phone?: string;
    specialInstructions?: string;
    familyDoctor?: string;
    doctorPhone?: string;
    medicalConditions?: string[];
    medicalConditionsDetails?: string;
    childhoodSicknesses?: string;
    lifeThreateningAllergies?: string;
    otherAllergies?: string;
    regularMedications?: string;
    regularMedicationsDetails?: string;
    majorOperations?: string;
    behaviorProblems?: string;
    behaviorProblemsDetails?: string;
    speechHearingProblems?: string;
    speechHearingProblemsDetails?: string;
    birthComplications?: string;
    birthComplicationsDetails?: string;
    immunisationUpToDate?: string;
    familyMedicalHistory?: string;
    medicalConsent1?: string;
    medicalConsent1Father?: boolean;
    medicalConsent1Mother?: boolean;
    medicalConsent1Guardian?: boolean;
    medicalConsent2?: string;
    medicalConsent2Father?: boolean;
    medicalConsent2Mother?: boolean;
    medicalConsent2Guardian?: boolean;
    maritalStatus?: string;
    livesWith?: string;
    motherTitle?: string;
    motherSurname?: string;
    motherFirstNames?: string;
    motherIdNumber?: string;
    motherOccupation?: string;
    motherEmployer?: string;
    motherWorkPhone?: string;
    motherHomePhone?: string;
    motherCell?: string;
    motherEmail?: string;
    motherHomeAddress?: string;
    motherPostalAddress?: string;
    motherWorkAddress?: string;
    fatherTitle?: string;
    fatherSurname?: string;
    fatherFirstNames?: string;
    fatherIdNumber?: string;
    fatherOccupation?: string;
    fatherEmployer?: string;
    fatherWorkPhone?: string;
    fatherHomePhone?: string;
    fatherCell?: string;
    fatherEmail?: string;
    fatherHomeAddress?: string;
    fatherPostalAddress?: string;
    fatherWorkAddress?: string;
    guardianTitle?: string;
    guardianSurname?: string;
    guardianFirstNames?: string;
    guardianIdNumber?: string;
    guardianOccupation?: string;
    guardianEmployer?: string;
    guardianWorkPhone?: string;
    guardianHomePhone?: string;
    guardianCell?: string;
    guardianEmail?: string;
    guardianHomeAddress?: string;
    guardianPostalAddress?: string;
    guardianWorkAddress?: string;
    financialAgreedTerms?: boolean;
    financialAgreedLiability?: boolean;
    financialAgreedCancellation?: boolean;
    motherFinancialSignature?: string;
    motherFinancialDate?: string;
    fatherFinancialSignature?: string;
    fatherFinancialDate?: string;
    monthlyAmount?: number;
    paymentDate?: string;
    popiConsent?: boolean;
    motherPopiSignature?: string;
    motherPopiDate?: string;
    fatherPopiSignature?: string;
    fatherPopiDate?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface Class {
    id: number;
    className: string;
    teachers: string[];
    subjects: string[];
    classSection: string;
    updatedAt?: string;
    createdAt?: string;
  }
  
  // Union type for all entities
  export type DatabaseEntity = 
    | ClassActivity 
    | Student 
    | Teacher 
    | Staff 
    | StaffAttendance 
    | StaffLeave 
    | StaffSalary 
    | SubjectTeacher 
    | ParentStudentRelation 
    | Parent 
    | Subject 
    | RegisteredStudent 
    | Class;
  
  // Type for table names
  export type TableName = 
    | 'classActivities'
    | 'students'
    | 'teachers'
    | 'staff'
    | 'staffAttendance'
    | 'staffLeave'
    | 'staffSalary'
    | 'subjectTeachers'
    | 'parentStudentRelations'
    | 'parents'
    | 'subjects'
    | 'registeredStudents'
    | 'classes';
  
  // Insert types (for creating new records)
  export interface InsertClassActivity {
    title: string;
    date: string;
    className?: string;
  }
  
  export interface InsertStudent {
    name: string;
    surname: string;
    phone?: string;
    address?: string;
    attendance?: string;
    class?: string;
    email?: string;
  }
  
  export interface InsertTeacher {
    name: string;
    surname: string;
    role: string;
    email: string;
    phone: string;
    subjects: string[];
    experience: number;
    qualification: string;
    staffId: number;
    classRole?: string;
  }
  
  export interface InsertStaff {
    staffId: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    address?: string;
    dateOfBirth?: string;
    gender?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    employmentType: string;
    position: string;
    department: string;
    hireDate: string;
    terminationDate?: string;
    employmentStatus?: string;
    qualification: string;
    specialization?: string;
    experience?: number;
    certifications?: string[];
    subjects?: string[];
    role: string;
    permissions?: any;
    accessLevel?: number;
    isActive?: boolean;
  }
  
  // Update types (for partial updates)
  export type UpdateClassActivity = Partial<InsertClassActivity>;
  export type UpdateStudent = Partial<InsertStudent>;
  export type UpdateTeacher = Partial<InsertTeacher>;
  export type UpdateStaff = Partial<InsertStaff>;
  
  // Response types for API
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  // Form data types for frontend
  export interface StaffFormData extends Omit<InsertStaff, 'staffId' | 'id'> {
    id?: number;
    staffId?: string;
  }
  
  export interface TeacherFormData extends Omit<InsertTeacher, 'staffId' | 'id'> {
    id?: number;
    staffId?: number;
  }
  
  export interface StudentFormData extends Omit<InsertStudent, 'id'> {
    id?: number;
  }
  
  // Search and filter types
  export interface SearchFilters {
    query?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
  
  export interface StaffFilters extends SearchFilters {
    department?: string;
    role?: string;
    employmentStatus?: string;
    isActive?: boolean;
  }
  
  export interface StudentFilters extends SearchFilters {
    class?: string;
    attendance?: string;
  }
  
  // Export all types
  export type {
    ClassActivity as ClassActivityType,
    Student as StudentType,
    Teacher as TeacherType,
    Staff as StaffType,
    StaffAttendance as StaffAttendanceType,
    StaffLeave as StaffLeaveType,
    StaffSalary as StaffSalaryType,
    SubjectTeacher as SubjectTeacherType,
    ParentStudentRelation as ParentStudentRelationType,
    Parent as ParentType,
    Subject as SubjectType,
    RegisteredStudent as RegisteredStudentType,
    Class as ClassType,
  };

  export type Chapter = {
    id: string;
    title: string;
    topics: Topic[];
    order: number;
    };
    
    export type Topic = {
    id: string;
    title: string;
    duration: string; // e.g., "2 weeks", "5 hours"
    objectives: string[];
    resources: string[];
    isCompleted: boolean;
    order: number;
    };

export type Curriculum = {
  id: number;
  title: string;
  description?: string | null; // Change from string | undefined to string | null | undefined
  academicYear: string;
  status?: string | null;
  classId: number;
  subjectId: number;
  className?: string | null;
  subjectName?: string | null;
  chapters?: Chapter[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}