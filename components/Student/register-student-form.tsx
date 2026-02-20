'use client'

import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { Select } from "@/components/FormElements/select";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { ShowcaseSectionDesc } from "@/components/Layouts/showcase-section";
import LangaugeMultiSelect from "@components/FormElements/MultiSelect/LangaugeMultiSelect";
import RelationsMultiSelect from "@/components/FormElements/MultiSelect/RelationsMultiSelect";
import { registerStudent, checkEmailExists, checkPhoneExists } from "@api/student-actions";
import { useState, useEffect, useRef, useCallback } from 'react';
import { getRegisteredStudentByIdNumber } from '@api/student-actions';

interface RegisterStudentFormState {
  idNumber: string;
  surname: string;
  firstName: string;
  prefferedName: string;
  dateOfBirth?: string;
  sex?: string;
  homeLanguage?: string[];
  email?: string,
  phone?: string,
  religion?: string;
  numberOfChildrenInFamily?: number;
  positionInFamily?: number;
  authorizedToBring?: string[];
  authorizedToCollect?: string[];
  previousSchool?: string;
  intendedPrimarySchool?: string;
  careRequired?: string;
  dateOfEnrolment?: string;
  ageAtEnrolment?: number;
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
  maritalStatus?: string;
  livesWith?: string[];
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
  guardianWorkAddress?: string;
}

// ─── Inline field validation state shape ─────────────────────────────────────
type FieldValidationState = 'idle' | 'checking' | 'taken' | 'available';

interface FieldValidation {
  state: FieldValidationState;
  message: string;
}

// ─── SA ID ↔ Date of Birth helpers ───────────────────────────────────────────

function idDigitsToDOB(digits: string): string | null {
  if (digits.length < 6) return null;
  const yy = parseInt(digits.slice(0, 2), 10);
  const mm = parseInt(digits.slice(2, 4), 10);
  const dd = parseInt(digits.slice(4, 6), 10);
  if (isNaN(yy) || isNaN(mm) || isNaN(dd)) return null;
  if (mm < 1 || mm > 12) return null;
  if (dd < 1 || dd > 31) return null;
  const currentYY = new Date().getFullYear() % 100;
  const fullYear = yy <= currentYY ? 2000 + yy : 1900 + yy;
  const month = String(mm).padStart(2, '0');
  const day = String(dd).padStart(2, '0');
  const date = new Date(`${fullYear}-${month}-${day}`);
  if (
    date.getFullYear() !== fullYear ||
    date.getMonth() + 1 !== mm ||
    date.getDate() !== dd
  ) return null;
  return `${fullYear}-${month}-${day}`;
}

function dobToIdPrefix(dob: string): string | null {
  if (!dob || dob.length < 10) return null;
  const [year, month, day] = dob.split('-');
  if (!year || !month || !day) return null;
  return `${year.slice(-2)}${month}${day}`;
}

function idDigitToSex(idNumber: string): 'MALE' | 'FEMALE' | null {
  if (idNumber.length < 7) return null;
  const genderDigit = parseInt(idNumber[6], 10);
  if (isNaN(genderDigit)) return null;
  return genderDigit >= 5 ? 'MALE' : 'FEMALE';
}

// ─── Full SA ID number validation ────────────────────────────────────────────
// SA ID format: YYMMDD GGGG C A Z
//   YYMMDD  – date of birth
//   GGGG    – gender (0000–4999 female, 5000–9999 male)
//   C       – citizenship (0 = SA citizen, 1 = permanent resident)
//   A       – usually 8 (race digit, legacy — we accept any digit)
//   Z       – Luhn checksum digit

interface SAIdValidationResult {
  valid: boolean;
  errors: string[];
}

function validateSAIdNumber(id: string): SAIdValidationResult {
  const errors: string[] = [];

  // 1. Must be exactly 13 digits
  if (!/^\d{13}$/.test(id)) {
    errors.push('ID number must be exactly 13 numeric digits.');
    return { valid: false, errors };
  }

  // 2. Date of birth digits must form a valid calendar date
  const dob = idDigitsToDOB(id.slice(0, 6));
  if (!dob) {
    errors.push('The first 6 digits must form a valid date (YYMMDD).');
  }

  // 3. Date of birth must not be in the future
  if (dob && new Date(dob) > new Date()) {
    errors.push('Date of birth derived from ID number is in the future.');
  }

  // 4. Citizenship digit must be 0 or 1
  const citizenshipDigit = parseInt(id[10], 10);
  if (citizenshipDigit !== 0 && citizenshipDigit !== 1) {
    errors.push('Digit 11 (citizenship) must be 0 (SA citizen) or 1 (permanent resident).');
  }

  // 5. Luhn algorithm checksum on all 13 digits
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    let digit = parseInt(id[i], 10);
    if (i % 2 !== 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  if (checkDigit !== parseInt(id[12], 10)) {
    errors.push('ID number fails the Luhn checksum — it may contain a typo.');
  }

  return { valid: errors.length === 0, errors };
}

// ─── Field section map (for error location hints) ────────────────────────────
const FIELD_SECTION_MAP: Record<string, string> = {
  id_number:                    'Particulars of Child → ID Number',
  email:                        'Particulars of Child → Primary Email',
  phone:                        'Particulars of Child → Primary Phone Number',
  name:                         'Particulars of Child → First Name',
  surname:                      'Particulars of Child → Surname',
  date_of_birth:                'Particulars of Child → Date of Birth',
  sex:                          'Particulars of Child → Sex',
  religion:                     'Particulars of Child → Religion',
  care_required:                'Particulars of Child → Care Required',
  date_of_enrolment:            'Particulars of Child → Date of Enrolment',
  marital_status:               'Additional Information → Marital Status',
  mother_email:                 "Parent/Guardian Particulars → Mother's Email",
  mother_cell:                  "Parent/Guardian Particulars → Mother's Cell Phone",
  mother_work_phone:            "Parent/Guardian Particulars → Mother's Work Phone",
  mother_home_phone:            "Parent/Guardian Particulars → Mother's Home Phone",
  mother_id_number:             "Parent/Guardian Particulars → Mother's ID Number",
  mother_surname:               "Parent/Guardian Particulars → Mother's Surname",
  mother_first_names:           "Parent/Guardian Particulars → Mother's First Names",
  father_email:                 "Parent/Guardian Particulars → Father's Email",
  father_cell:                  "Parent/Guardian Particulars → Father's Cell Phone",
  father_work_phone:            "Parent/Guardian Particulars → Father's Work Phone",
  father_home_phone:            "Parent/Guardian Particulars → Father's Home Phone",
  father_id_number:             "Parent/Guardian Particulars → Father's ID Number",
  father_surname:               "Parent/Guardian Particulars → Father's Surname",
  father_first_names:           "Parent/Guardian Particulars → Father's First Names",
  guardian_email:               "Parent/Guardian Particulars → Guardian's Email",
  guardian_cell:                "Parent/Guardian Particulars → Guardian's Cell Phone",
  guardian_work_phone:          "Parent/Guardian Particulars → Guardian's Work Phone",
  guardian_home_phone:          "Parent/Guardian Particulars → Guardian's Home Phone",
  guardian_id_number:           "Parent/Guardian Particulars → Guardian's ID Number",
  guardian_surname:             "Parent/Guardian Particulars → Guardian's Surname",
  guardian_first_names:         "Parent/Guardian Particulars → Guardian's First Names",
  emergency_contact_friend_name:  'Emergency Contact → Friend Name',
  emergency_contact_friend_cell:  'Emergency Contact → Friend Cell',
  emergency_contact_kin_name:     'Emergency Contact → Next of Kin Name',
  emergency_contact_kin_cell:     'Emergency Contact → Next of Kin Cell',
};

// ─── Reusable inline validation badge ────────────────────────────────────────
function FieldValidationBadge({ validation }: { validation: FieldValidation }) {
  if (validation.state === 'idle') return null;

  const config = {
    checking: {
      containerClass: 'bg-blue-50 border-blue-200',
      dotClass: 'border-blue-500 border-b-transparent animate-spin',
      textClass: 'text-blue-700',
    },
    taken: {
      containerClass: 'bg-red-50 border-red-300',
      dotClass: 'bg-red-500 rounded-full',
      textClass: 'text-red-700',
    },
    available: {
      containerClass: 'bg-green-50 border-green-200',
      dotClass: 'bg-green-500 rounded-full',
      textClass: 'text-green-700',
    },
  }[validation.state];

  return (
    <div className={`flex items-start gap-2 mt-2 p-2 rounded-md border ${config.containerClass}`}>
      <div className={`flex-shrink-0 mt-0.5 w-3 h-3 border-2 ${config.dotClass}`} />
      <p className={`text-xs font-medium leading-snug ${config.textClass}`}>
        {validation.message}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function RegisterStudentForm() {

  const relationshipOptions = [
    { value: "GUARDIAN", label: "GUARDIAN" },
    { value: "GRANDFATHER", label: "GRANDFATHER" },
    { value: "GRANDMOTHER", label: "GRANDMOTHER" },
    { value: "BROTHER", label: "BROTHER" },
    { value: "SISTER", label: "SISTER" },
    { value: "UNCLE", label: "UNCLE" },
    { value: "AUNT", label: "AUNT" },
    { value: "COUSIN", label: "COUSIN" },
    { value: "STEP FATHER", label: "STEP FATHER" },
    { value: "STEP MOTHER", label: "STEP MOTHER" },
    { value: "LEGAL GUARDIAN", label: "LEGAL GUARDIAN" },
    { value: "FAMILY FRIEND", label: "FAMILY FRIEND" },
    { value: "OTHER RELATIVE", label: "OTHER RELATIVE" }
  ];

  const titleOptions = [
    { value: "MR", label: "MR" },
    { value: "MRS", label: "MRS" },
    { value: "MS", label: "MS" },
    { value: "MISS", label: "MISS" },
    { value: "DR", label: "DR" },
    { value: "PROF", label: "PROF" },
    { value: "REV", label: "REV" },
    { value: "SIR", label: "SIR" },
    { value: "LORD", label: "LORD" },
    { value: "LADY", label: "LADY" },
    { value: "CAPT", label: "CAPT" },
    { value: "MAJ", label: "MAJ" },
    { value: "COL", label: "COL" },
    { value: "MX", label: "MX" }
  ];

  const [registeredStudent, setRegisteredStudent] = useState<RegisterStudentFormState>({
    idNumber: '',
    surname: '',
    firstName: '',
    prefferedName: '',
    dateOfBirth: '',
    sex: '',
    homeLanguage: [],
    email: '',
    phone: '',
    religion: '',
    numberOfChildrenInFamily: 0,
    positionInFamily: 0,
    authorizedToBring: [],
    authorizedToCollect: [],
    previousSchool: '',
    intendedPrimarySchool: '',
    careRequired: '',
    dateOfEnrolment: new Date().toISOString().split('T')[0],
    ageAtEnrolment: undefined,
    emergencyContactFriendName: '',
    emergencyContactFriendRelationship: '',
    emergencyContactFriendAddress: '',
    emergencyContactFriendWorkPhone: '',
    emergencyContactFriendHomePhone: '',
    emergencyContactFriendCell: '',
    emergencyContactKinName: '',
    emergencyContactKinRelationship: '',
    emergencyContactKinAddress: '',
    emergencyContactKinWorkPhone: '',
    emergencyContactKinHomePhone: '',
    emergencyContactKinCell: '',
    transportContact1Name: '',
    transportContact1Phone: '',
    transportContact2Name: '',
    transportContact2Phone: '',
    transportContact3Name: '',
    transportContact3Phone: '',
    specialInstructions: '',
    maritalStatus: '',
    livesWith: [],
    motherTitle: '',
    motherSurname: '',
    motherFirstNames: '',
    motherIdNumber: '',
    motherOccupation: '',
    motherEmployer: '',
    motherWorkPhone: '',
    motherHomePhone: '',
    motherCell: '',
    motherEmail: '',
    motherHomeAddress: '',
    motherWorkAddress: '',
    fatherTitle: '',
    fatherSurname: '',
    fatherFirstNames: '',
    fatherIdNumber: '',
    fatherOccupation: '',
    fatherEmployer: '',
    fatherWorkPhone: '',
    fatherHomePhone: '',
    fatherCell: '',
    fatherEmail: '',
    fatherHomeAddress: '',
    fatherWorkAddress: '',
    guardianTitle: '',
    guardianSurname: '',
    guardianFirstNames: '',
    guardianIdNumber: '',
    guardianOccupation: '',
    guardianEmployer: '',
    guardianWorkPhone: '',
    guardianHomePhone: '',
    guardianCell: '',
    guardianEmail: '',
    guardianHomeAddress: '',
    guardianWorkAddress: '',
  });

  // ── Inline field validation state ─────────────────────────────────────────
  const [emailValidation, setEmailValidation] = useState<FieldValidation>({ state: 'idle', message: '' });
  const [phoneValidation, setPhoneValidation] = useState<FieldValidation>({ state: 'idle', message: '' });
  const [idValidation, setIdValidation] = useState<SAIdValidationResult | null>(null);

  // ── Student lookup + submission state ──────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [studentFound, setStudentFound] = useState<boolean | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string>('');
  const [errorField, setErrorField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const lastChangedField = useRef<'idNumber' | 'dateOfBirth' | null>(null);
  // Track whether the currently loaded data belongs to an existing student
  // (so we skip the duplicate check for their own email/phone)
  const existingStudentIdRef = useRef<string | null>(null);

  // ── ID Number change handler ──────────────────────────────────────────────
  const handleIdNumberChange = (idNumber: string) => {
    lastChangedField.current = 'idNumber';
    const derivedDOB = idNumber.length >= 6 ? idDigitsToDOB(idNumber.slice(0, 6)) : null;
    const derivedSex = idDigitToSex(idNumber);
    setRegisteredStudent(prev => ({
      ...prev,
      idNumber,
      ...(derivedDOB ? { dateOfBirth: derivedDOB } : {}),
      ...(derivedSex ? { sex: derivedSex } : {}),
    }));

    // Run full SA ID validation once all 13 digits are present
    if (idNumber.length === 13) {
      setIdValidation(validateSAIdNumber(idNumber));
    } else {
      setIdValidation(null);
    }
  };

  // ── Date of Birth change handler ──────────────────────────────────────────
  const handleDateOfBirthChange = (dob: string) => {
    lastChangedField.current = 'dateOfBirth';
    const prefix = dobToIdPrefix(dob);
    setRegisteredStudent(prev => {
      let newIdNumber = prev.idNumber;
      if (prefix) {
        newIdNumber = prev.idNumber.length <= 6 ? prefix : prefix + prev.idNumber.slice(6);
      }
      return { ...prev, dateOfBirth: dob, idNumber: newIdNumber };
    });
  };

  // ── Email change handler — triggers debounced live check ─────────────────
  const handleEmailChange = (email: string) => {
    setRegisteredStudent(prev => ({ ...prev, email }));

    // Reset to idle immediately on every keystroke
    setEmailValidation({ state: 'idle', message: '' });
  };

  // ── Phone change handler — triggers debounced live check ─────────────────
  const handlePhoneChange = (phone: string) => {
    setRegisteredStudent(prev => ({ ...prev, phone }));
    setPhoneValidation({ state: 'idle', message: '' });
  };

  // ── Debounced email duplicate check ──────────────────────────────────────
  useEffect(() => {
    const email = registeredStudent.email?.trim() ?? '';

    // Don't check if empty, too short, or no @ sign yet
    if (!email || email.length < 5 || !email.includes('@')) {
      setEmailValidation({ state: 'idle', message: '' });
      return;
    }

    // Don't re-check against the student whose record we loaded
    const excludeId = existingStudentIdRef.current ?? undefined;

    setEmailValidation({ state: 'checking', message: 'Checking if email is already registered...' });

    const timer = setTimeout(async () => {
      try {
        const result = await checkEmailExists(email, excludeId);
        if (result.exists) {
          setEmailValidation({
            state: 'taken',
            message: `⚠ This email is already registered to ${result.studentName}. Please use a different email or search for the existing student by their ID number above.`,
          });
        } else {
          setEmailValidation({
            state: 'available',
            message: '✓ This email address is available.',
          });
        }
      } catch {
        // Network/server error — don't block the user, just reset
        setEmailValidation({ state: 'idle', message: '' });
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [registeredStudent.email]);

  // ── Debounced phone duplicate check ──────────────────────────────────────
  useEffect(() => {
    const phone = registeredStudent.phone?.trim() ?? '';

    // Don't check until we have at least 7 digits
    if (!phone || phone.replace(/\D/g, '').length < 7) {
      setPhoneValidation({ state: 'idle', message: '' });
      return;
    }

    const excludeId = existingStudentIdRef.current ?? undefined;

    setPhoneValidation({ state: 'checking', message: 'Checking if phone number is already registered...' });

    const timer = setTimeout(async () => {
      try {
        const result = await checkPhoneExists(phone, excludeId);
        if (result.exists) {
          setPhoneValidation({
            state: 'taken',
            message: `⚠ This phone number is already registered to ${result.studentName}. Please use a different number or search for the existing student by their ID number above.`,
          });
        } else {
          setPhoneValidation({
            state: 'available',
            message: '✓ This phone number is available.',
          });
        }
      } catch {
        setPhoneValidation({ state: 'idle', message: '' });
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [registeredStudent.phone]);

  // ── Age at enrolment — auto-calculated from DOB + enrolment date ─────────
  useEffect(() => {
    const dob = registeredStudent.dateOfBirth;
    const enrolment = registeredStudent.dateOfEnrolment;
    if (!dob || !enrolment) return;

    const dobDate = new Date(dob);
    const enrolDate = new Date(enrolment);
    if (isNaN(dobDate.getTime()) || isNaN(enrolDate.getTime())) return;

    let years = enrolDate.getFullYear() - dobDate.getFullYear();
    const monthDiff = enrolDate.getMonth() - dobDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && enrolDate.getDate() < dobDate.getDate())) {
      years--;
    }

    if (years >= 0) {
      setRegisteredStudent(prev => ({ ...prev, ageAtEnrolment: years }));
    }
  }, [registeredStudent.dateOfBirth, registeredStudent.dateOfEnrolment]);

  // ── Debounced student lookup (fires when idNumber changes) ────────────────
  useEffect(() => {
    if (lastChangedField.current === 'dateOfBirth') return;

    const id = registeredStudent.idNumber;
    if (!id || id.length < 6) {
      setStudentFound(null);
      setSearchAttempted(false);
      existingStudentIdRef.current = null;
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      setSearchAttempted(true);
      try {
        const student = await getRegisteredStudentByIdNumber(id);
        if (student) {
          // Store the ID so email/phone checkers can exclude this student
          existingStudentIdRef.current = student.idNumber;

          setRegisteredStudent(prev => ({
            ...prev,
            idNumber: student.idNumber || '',
            surname: student.surname || '',
            firstName: student.name || '',
            prefferedName: student.preferredName || '',
            dateOfBirth: student.dateOfBirth || '',
            sex: student.sex || '',
            homeLanguage: student.homeLanguage
              ? (Array.isArray(student.homeLanguage) ? student.homeLanguage : [student.homeLanguage])
              : [],
            email: student.email || '',
            phone: student.phone || '',
            religion: student.religion || '',
            numberOfChildrenInFamily: student.numberOfChildrenInFamily || undefined,
            positionInFamily: student.positionInFamily || undefined,
            authorizedToBring: student.authorizedToBring || [],
            authorizedToCollect: student.authorizedToCollect || [],
            previousSchool: student.previousSchool || '',
            intendedPrimarySchool: student.intendedPrimarySchool || '',
            careRequired: student.careRequired || '',
            dateOfEnrolment: student.dateOfEnrolment || '',
            ageAtEnrolment: student.ageAtEnrolment || undefined,
            emergencyContactFriendName: student.emergencyContactFriendName || '',
            emergencyContactFriendRelationship: student.emergencyContactFriendRelationship || '',
            emergencyContactFriendAddress: student.emergencyContactFriendAddress || '',
            emergencyContactFriendWorkPhone: student.emergencyContactFriendWorkPhone || '',
            emergencyContactFriendHomePhone: student.emergencyContactFriendHomePhone || '',
            emergencyContactFriendCell: student.emergencyContactFriendCell || '',
            emergencyContactKinName: student.emergencyContactKinName || '',
            emergencyContactKinRelationship: student.emergencyContactKinRelationship || '',
            emergencyContactKinAddress: student.emergencyContactKinAddress || '',
            emergencyContactKinWorkPhone: student.emergencyContactKinWorkPhone || '',
            emergencyContactKinHomePhone: student.emergencyContactKinHomePhone || '',
            emergencyContactKinCell: student.emergencyContactKinCell || '',
            transportContact1Name: student.transportContact1Name || '',
            transportContact1Phone: student.transportContact1Phone || '',
            transportContact2Name: student.transportContact2Name || '',
            transportContact2Phone: student.transportContact2Phone || '',
            transportContact3Name: student.transportContact3Name || '',
            transportContact3Phone: student.transportContact3Phone || '',
            specialInstructions: student.specialInstructions || '',
            maritalStatus: student.maritalStatus || '',
            livesWith: Array.isArray(student.livesWith) ? student.livesWith : [],
            motherTitle: student.motherTitle || '',
            motherSurname: student.motherSurname || '',
            motherFirstNames: student.motherFirstNames || '',
            motherIdNumber: student.motherIdNumber || '',
            motherOccupation: student.motherOccupation || '',
            motherEmployer: student.motherEmployer || '',
            motherWorkPhone: student.motherWorkPhone || '',
            motherHomePhone: student.motherHomePhone || '',
            motherCell: student.motherCell || '',
            motherEmail: student.motherEmail || '',
            motherHomeAddress: student.motherHomeAddress || '',
            motherWorkAddress: student.motherWorkAddress || '',
            fatherTitle: student.fatherTitle || '',
            fatherSurname: student.fatherSurname || '',
            fatherFirstNames: student.fatherFirstNames || '',
            fatherIdNumber: student.fatherIdNumber || '',
            fatherOccupation: student.fatherOccupation || '',
            fatherEmployer: student.fatherEmployer || '',
            fatherWorkPhone: student.fatherWorkPhone || '',
            fatherHomePhone: student.fatherHomePhone || '',
            fatherCell: student.fatherCell || '',
            fatherEmail: student.fatherEmail || '',
            fatherHomeAddress: student.fatherHomeAddress || '',
            fatherWorkAddress: student.fatherWorkAddress || '',
            guardianTitle: student.guardianTitle || '',
            guardianSurname: student.guardianSurname || '',
            guardianFirstNames: student.guardianFirstNames || '',
            guardianIdNumber: student.guardianIdNumber || '',
            guardianOccupation: student.guardianOccupation || '',
            guardianEmployer: student.guardianEmployer || '',
            guardianWorkPhone: student.guardianWorkPhone || '',
            guardianHomePhone: student.guardianHomePhone || '',
            guardianCell: student.guardianCell || '',
            guardianEmail: student.guardianEmail || '',
            guardianHomeAddress: student.guardianHomeAddress || '',
            guardianWorkAddress: student.guardianWorkAddress || '',
          }));

          // Clear the inline validation badges — these values belong to an
          // existing student so they're not "taken" in a problematic way
          setEmailValidation({ state: 'idle', message: '' });
          setPhoneValidation({ state: 'idle', message: '' });

          setStudentFound(true);
        } else {
          existingStudentIdRef.current = null;
          setStudentFound(false);
        }
      } catch (error) {
        console.error('Error fetching student:', error);
        existingStudentIdRef.current = null;
        setStudentFound(false);
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [registeredStudent.idNumber]);

  // ── Generic field change handler ─────────────────────────────────────────
  const handleRegisterStudentFormChange = (
    field: keyof RegisterStudentFormState,
    value: string | string[] | number
  ) => {
    if (field === 'idNumber' && typeof value === 'string') { handleIdNumberChange(value); return; }
    if (field === 'dateOfBirth' && typeof value === 'string') { handleDateOfBirthChange(value); return; }
    if (field === 'email' && typeof value === 'string') { handleEmailChange(value); return; }
    if (field === 'phone' && typeof value === 'string') { handlePhoneChange(value); return; }
    setRegisteredStudent(prev => ({ ...prev, [field]: value }));
  };

  // ── Form submission handler ───────────────────────────────────────────────
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Block submission if either field has a known duplicate
    if (emailValidation.state === 'taken') {
      notificationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setSubmitErrorMessage('Please resolve the duplicate email address before submitting.');
      setErrorField('email');
      setSubmitStatus('error');
      return;
    }
    if (phoneValidation.state === 'taken') {
      notificationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setSubmitErrorMessage('Please resolve the duplicate phone number before submitting.');
      setErrorField('phone');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitErrorMessage('');
    setErrorField(null);

    const scrollToNotification = () =>
      notificationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const showError = (msg: string, field?: string) => {
      setSubmitErrorMessage(msg);
      setErrorField(field ?? null);
      setSubmitStatus('error');
      scrollToNotification();
      setTimeout(() => setSubmitStatus(null), 15000);
    };

    try {
      const formData = new FormData(e.currentTarget);
      const result = await registerStudent(formData);

      if (result && 'error' in result) {
        const raw = result.error as string;
        const field = (result as any).field as string | undefined;
        showError(raw, field);
        return;
      }

      setSubmitStatus('success');
      scrollToNotification();
      // Reset inline validations on success
      setEmailValidation({ state: 'idle', message: '' });
      setPhoneValidation({ state: 'idle', message: '' });
      setTimeout(() => setSubmitStatus(null), 6000);
    } catch (err) {
      console.error('Registration error:', err);
      showError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [emailValidation.state, phoneValidation.state]);

  // ── Submit notification banner ────────────────────────────────────────────
  const SubmitNotification = () => {
    if (!submitStatus) return null;

    const isSuccess = submitStatus === 'success';
    const sectionHint = errorField ? FIELD_SECTION_MAP[errorField] : null;
    const isDuplicateError = submitErrorMessage.toLowerCase().includes('already registered');

    return (
      <div className={`flex items-start gap-4 rounded-xl border p-5 mb-6 shadow-sm transition-all duration-300 ${isSuccess ? 'bg-green-50 border-green-300 text-green-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
        <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full text-white text-lg font-bold ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}>
          {isSuccess ? '✓' : '✕'}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base">
            {isSuccess ? 'Student Successfully Registered!' : 'Registration Failed'}
          </p>

          {isSuccess ? (
            <p className="text-sm mt-0.5 opacity-80">
              {registeredStudent.firstName || 'The student'} {registeredStudent.surname || ''} has been added to the system.
            </p>
          ) : (
            <>
              <p className="text-sm mt-1 opacity-90 break-words">
                {submitErrorMessage || 'Something went wrong. Please check the form and try again.'}
              </p>

              {sectionHint && (
                <div className="mt-2 flex items-start gap-2 bg-red-100 border border-red-200 rounded-md px-3 py-2">
                  <span className="text-base leading-none mt-0.5">📍</span>
                  <p className="text-xs font-semibold text-red-700">
                    Location in form: <span className="font-bold">{sectionHint}</span>
                  </p>
                </div>
              )}

              {isDuplicateError && (
                <p className="text-xs mt-2 font-medium opacity-70">
                  💡 Tip: Enter the student&apos;s ID number in the ID field above to load their existing record instead of creating a duplicate.
                </p>
              )}
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => { setSubmitStatus(null); setErrorField(null); }}
          className={`flex-shrink-0 text-xl leading-none font-bold opacity-50 hover:opacity-100 transition-opacity ${isSuccess ? 'text-green-800' : 'text-red-800'}`}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    );
  };

  // ── ID search status indicator ─────────────────────────────────────────────
  const StatusIndicator = () => {
    if (isLoading) {
      return (
        <div className="flex items-center mt-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
          <span className="text-sm text-blue-600 font-medium">Searching for student...</span>
        </div>
      );
    }
    if (!searchAttempted) {
      return <div className="mt-2"><span className="text-sm text-gray-500">Enter 6 or more characters to search</span></div>;
    }
    if (studentFound === true) {
      return (
        <div className="flex items-center mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm text-green-700 font-medium">✓ Student found - details auto-filled</span>
        </div>
      );
    }
    if (studentFound === false) {
      return (
        <div className="flex items-center mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
          <span className="text-sm text-yellow-700 font-medium">⚠ No student found with this ID number</span>
        </div>
      );
    }
    return null;
  };

  return (
    <ShowcaseSection title="Register Student Form" className="!p-6.5">
      <div ref={notificationRef}>
        <SubmitNotification />
      </div>

      <form onSubmit={handleSubmit}>

        {/* ── PARTICULARS OF CHILD ─────────────────────────────────────────── */}
        <ShowcaseSection title="PARTICULARS OF CHILD" className="space-y-5.5 !p-6.5 mb-4.5">

          <div className="mb-6">
            <InputGroup
              label="ID NUMBER / PASSPORT NUMBER"
              name="idNumber"
              type="text"
              placeholder="Enter ID or passport number"
              className="w-full"
              value={registeredStudent.idNumber}
              onChange={(e) => handleRegisterStudentFormChange('idNumber', e.target.value)}
              required
            />
            {/* SA ID validation feedback */}
            {idValidation !== null && (
              <div className={`flex flex-col gap-1 mt-2 p-2.5 rounded-md border ${idValidation.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-300'}`}>
                {idValidation.valid ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full" />
                    <p className="text-xs font-medium text-green-700">✓ Valid South African ID number</p>
                  </div>
                ) : (
                  idValidation.errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5 w-3 h-3 bg-red-500 rounded-full" />
                      <p className="text-xs font-medium text-red-700">{err}</p>
                    </div>
                  ))
                )}
              </div>
            )}
            <StatusIndicator />
          </div>

          <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
            <InputGroup
              label="SURNAME"
              name="surname"
              type="text"
              placeholder="Enter last name"
              className="w-full xl:w-1/2"
              value={registeredStudent.surname}
              onChange={(e) => handleRegisterStudentFormChange('surname', e.target.value)}
              required
            />
            <InputGroup
              label="FIRST NAME/S"
              name="name"
              type="text"
              placeholder="Enter first name(s)"
              className="w-full xl:w-1/2"
              value={registeredStudent.firstName}
              onChange={(e) => handleRegisterStudentFormChange('firstName', e.target.value)}
              required
            />
          </div>

          <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
            <InputGroup
              label="Preferred Name or Nick Name"
              type="text"
              name="preferredName"
              placeholder="Enter preferred/nick name(s)"
              className="w-full xl:w-1/2"
              value={registeredStudent.prefferedName}
              onChange={(e) => handleRegisterStudentFormChange('prefferedName', e.target.value)}
            />
            <InputGroup
              label="DATE OF BIRTH"
              name="dateOfBirth"
              type="date"
              placeholder="2000/02/02"
              className="w-full xl:w-1/2"
              value={registeredStudent.dateOfBirth}
              onChange={(e) => handleRegisterStudentFormChange('dateOfBirth', e.target.value)}
              required
            />
          </div>

          <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
            <Select
              label="SEX"
              name="sex"
              placeholder="SELECT GENDER"
              className="w-full xl:w-1/2"
              items={[
                { label: "MALE", value: "MALE" },
                { label: "FEMALE", value: "FEMALE" },
              ]}
              value={registeredStudent.sex}
              onChange={(value: string) => handleRegisterStudentFormChange('sex', value)}
              required
            />
            <LangaugeMultiSelect
              id="homeLanguage"
              name="homeLanguage"
              label="HOME LANGUAGE(S)"
              value={registeredStudent.homeLanguage}
              placeholder="SELECT HOME LANGUAGE(S)"
              onChange={(value: string[]) => handleRegisterStudentFormChange('homeLanguage', value)}
            />
          </div>

          {/* ── Email with live duplicate check ─────────────────────────── */}
          <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <InputGroup
                label="PRIMARY EMAIL"
                type="email"
                name="email"
                placeholder="Enter primary email address"
                className="w-full"
                value={registeredStudent.email}
                onChange={(e) => handleRegisterStudentFormChange('email', e.target.value)}
              />
              <FieldValidationBadge validation={emailValidation} />
            </div>

            {/* ── Phone with live duplicate check ──────────────────────── */}
            <div className="w-full xl:w-1/2">
              <InputGroup
                label="PRIMARY PHONE NUMBER"
                type="text"
                name="phone"
                placeholder="Enter primary phone number"
                className="w-full"
                value={registeredStudent.phone}
                onChange={(e) => handleRegisterStudentFormChange('phone', e.target.value)}
                required
              />
              <FieldValidationBadge validation={phoneValidation} />
            </div>
          </div>

          <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
            <Select
              label="RELIGION"
              name="religion"
              placeholder="SELECT RELIGION"
              className="w-full xl:w-full"
              items={[
                { label: "CHRISTIANITY", value: "CHRISTIANITY" },
                { label: "ISLAM", value: "ISLAM" },
                { label: "HINDUISM", value: "HINDUISM" },
                { label: "BUDDHISM", value: "BUDDHISM" },
                { label: "JUDAISM", value: "JUDAISM" },
                { label: "OTHER", value: "OTHER" },
              ]}
              value={registeredStudent.religion}
              onChange={(e) => handleRegisterStudentFormChange('religion', e)}
            />
          </div>

          <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
            <InputGroup
              label="NUMBER OF CHILDREN IN FAMILY"
              type="number"
              name="numberOfChildrenInFamily"
              placeholder="Number of children"
              className="w-full xl:w-1/2"
              value={registeredStudent.numberOfChildrenInFamily !== undefined ? String(registeredStudent.numberOfChildrenInFamily) : undefined}
              onChange={(e) => handleRegisterStudentFormChange('numberOfChildrenInFamily', parseInt(e.target.value) || '')}
            />
            <InputGroup
              label="POSITION IN FAMILY"
              type="number"
              name="positionInFamily"
              placeholder="Position in family"
              className="w-full xl:w-1/2"
              value={registeredStudent.positionInFamily !== undefined ? String(registeredStudent.positionInFamily) : undefined}
              onChange={(e) => handleRegisterStudentFormChange('positionInFamily', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
            <RelationsMultiSelect
              id="bringchildmultiselect"
              name="authorizedToBring"
              label="WHO WILL BRING THE CHILD TO SCHOOL"
              placeholder="SELECT WHO WILL BRING THE CHILD TO SCHOOL"
              value={registeredStudent.authorizedToBring}
              onChange={(value: string[]) => handleRegisterStudentFormChange('authorizedToBring', value)}
            />
            <RelationsMultiSelect
              id="collectchildmultiselect"
              name="authorizedToCollect"
              label="WHO WILL COLLECT THE CHILD FROM SCHOOL"
              placeholder="SELECT WHO WILL COLLECT THE CHILD FROM SCHOOL"
              value={registeredStudent.authorizedToCollect}
              onChange={(value: string[]) => handleRegisterStudentFormChange('authorizedToCollect', value)}
            />
          </div>

          <InputGroup
            label="PREVIOUS CRECHE/NURSERY SCHOOL ATTENDED"
            type="text"
            name="previousSchool"
            placeholder="Previous school name"
            className="w-full"
            value={registeredStudent.previousSchool}
            onChange={(e) => handleRegisterStudentFormChange('previousSchool', e.target.value)}
          />

          <InputGroup
            label="PRIMARY SCHOOL YOU INTEND SENDING YOUR CHILD TO"
            type="text"
            name="intendedPrimarySchool"
            placeholder="Intended primary school"
            className="w-full"
            value={registeredStudent.intendedPrimarySchool}
            onChange={(e) => handleRegisterStudentFormChange('intendedPrimarySchool', e.target.value)}
          />

          <ShowcaseSection title="PLEASE INDICATE THE CARE REQUIRED" className="space-y-5.5 !p-4">
            <div className="flex flex-col gap-4 xl:flex-row">
              <Select
                label="Select Care Required"
                name="careRequired"
                placeholder="Select care required"
                className="w-full xl:w-full"
                items={[
                  { label: "FULL DAY CARE", value: "FULL DAY CARE" },
                  { label: "HALF DAY CARE", value: "HALF DAY CARE" },
                ]}
                value={registeredStudent.careRequired}
                onChange={(value: string) => handleRegisterStudentFormChange('careRequired', value)}
              />
            </div>
          </ShowcaseSection>

          <div className="flex flex-col gap-4.5 xl:flex-row">
            <InputGroup
              label="DATE OF ENROLMENT"
              name="dateOfEnrolment"
              type="date"
              placeholder=""
              className="w-full xl:w-1/2"
              value={registeredStudent.dateOfEnrolment}
              onChange={(e) => handleRegisterStudentFormChange('dateOfEnrolment', e.target.value)}
            />
            <InputGroup
              label="AGE AT ENROLMENT"
              type="number"
              name="ageAtEnrolment"
              placeholder="Auto-calculated from ID number"
              className="w-full xl:w-1/2"
              value={registeredStudent.ageAtEnrolment !== undefined ? String(registeredStudent.ageAtEnrolment) : undefined}
              onChange={(e) => handleRegisterStudentFormChange('ageAtEnrolment', parseInt(e.target.value) || '')}
              readOnly
            />
          </div>
        </ShowcaseSection>

        {/* ── CONTACT PERSON OTHER THAN PARENTS ────────────────────────────── */}
        <ShowcaseSectionDesc
          title="CONTACT PERSON OTHER THAN PARENTS"
          className="space-y-5.5 !p-6.5 mb-4.5"
          description="In case of an emergency a responsible person should be on standby."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold mb-4 text-gray-700">Friend</h4>
              <div className="space-y-4">
                <InputGroup
                  label="SURNAME AND NAME"
                  type="text"
                  name="emergencyContactFriendName"
                  placeholder="Full Name"
                  value={registeredStudent.emergencyContactFriendName}
                  onChange={(e) => handleRegisterStudentFormChange('emergencyContactFriendName', e.target.value)}
                />
                <Select
                  name="emergencyContactFriendRelationship"
                  label="Relationship"
                  placeholder="Select relationship"
                  items={relationshipOptions}
                  value={registeredStudent.emergencyContactFriendRelationship}
                  onChange={(value: string) => handleRegisterStudentFormChange('emergencyContactFriendRelationship', value)}
                />
                <TextAreaGroup
                  label="Physical Address"
                  name="emergencyContactFriendAddress"
                  placeholder="Enter physical address"
                  value={registeredStudent.emergencyContactFriendAddress}
                  onChange={(e) => handleRegisterStudentFormChange('emergencyContactFriendAddress', e.target.value)}
                />
                <InputGroup
                  label="Telephone no. (Work)"
                  type="text"
                  name="emergencyContactFriendWorkPhone"
                  placeholder="Work number"
                  value={registeredStudent.emergencyContactFriendWorkPhone}
                  onChange={(e) => handleRegisterStudentFormChange('emergencyContactFriendWorkPhone', e.target.value)}
                />
                <InputGroup
                  label="Telephone no. (Home)"
                  type="text"
                  name="emergencyContactFriendHomePhone"
                  placeholder="Home number"
                  value={registeredStudent.emergencyContactFriendHomePhone}
                  onChange={(e) => handleRegisterStudentFormChange('emergencyContactFriendHomePhone', e.target.value)}
                />
                <InputGroup
                  label="Cell no."
                  type="text"
                  name="emergencyContactFriendCell"
                  placeholder="Cell number"
                  value={registeredStudent.emergencyContactFriendCell}
                  onChange={(e) => handleRegisterStudentFormChange('emergencyContactFriendCell', e.target.value)}
                />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-700">Next of Kin</h4>
              <div className="space-y-4">
                <InputGroup
                  label="Name and Surname"
                  type="text"
                  name="emergencyContactKinName"
                  placeholder="Full name"
                  value={registeredStudent.emergencyContactKinName}
                  onChange={(e) => handleRegisterStudentFormChange('emergencyContactKinName', e.target.value)}
                />
                <Select
                  name="emergencyContactKinRelationship"
                  label="Relationship"
                  placeholder="Select relationship"
                  items={relationshipOptions}
                  value={registeredStudent.emergencyContactKinRelationship}
                  onChange={(value: string) => handleRegisterStudentFormChange('emergencyContactKinRelationship', value)}
                />
                <TextAreaGroup
                  label="Physical Address"
                  name="emergencyContactKinAddress"
                  placeholder="Enter physical address"
                  value={registeredStudent.emergencyContactKinAddress}
                  onChange={(e) => handleRegisterStudentFormChange('emergencyContactKinAddress', e.target.value)}
                />
                <InputGroup
                  label="Telephone no. (Work)"
                  type="text"
                  name="emergencyContactKinWorkPhone"
                  placeholder="Work number"
                  value={registeredStudent.emergencyContactKinWorkPhone}
                  onChange={(e) => handleRegisterStudentFormChange('emergencyContactKinWorkPhone', e.target.value)}
                />
                <InputGroup
                  label="Telephone no. (Home)"
                  type="text"
                  name="emergencyContactKinHomePhone"
                  placeholder="Home number"
                  value={registeredStudent.emergencyContactKinHomePhone}
                  onChange={(e) => handleRegisterStudentFormChange('emergencyContactKinHomePhone', e.target.value)}
                />
                <InputGroup
                  label="Cell no."
                  type="text"
                  name="emergencyContactKinCell"
                  placeholder="Cell number"
                  value={registeredStudent.emergencyContactKinCell}
                  onChange={(e) => handleRegisterStudentFormChange('emergencyContactKinCell', e.target.value)}
                />
              </div>
            </div>
          </div>
        </ShowcaseSectionDesc>

        {/* ── TRANSPORT ─────────────────────────────────────────────────────── */}
        <ShowcaseSectionDesc
          title="TRANSPORT"
          className="space-y-5.5 !p-6.5 mb-4.5"
          description="Others who are authorised to collect child from school"
        >
          {[1, 2, 3].map((index) => (
            <div key={index} className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
              <InputGroup
                label="Name"
                type="text"
                name={`transportContact${index}Name`}
                placeholder="Enter name"
                className="w-full xl:w-1/2"
                value={registeredStudent[`transportContact${index}Name` as keyof RegisterStudentFormState] as string}
                onChange={(e) => handleRegisterStudentFormChange(`transportContact${index}Name` as keyof RegisterStudentFormState, e.target.value)}
              />
              <InputGroup
                label="Telephone no."
                type="text"
                name={`transportContact${index}Phone`}
                placeholder="Enter contact number"
                className="w-full xl:w-1/2"
                value={registeredStudent[`transportContact${index}Phone` as keyof RegisterStudentFormState] as string}
                onChange={(e) => handleRegisterStudentFormChange(`transportContact${index}Phone` as keyof RegisterStudentFormState, e.target.value)}
              />
            </div>
          ))}
        </ShowcaseSectionDesc>

        <TextAreaGroup
          label="SPECIAL INSTRUCTIONS"
          name="specialInstructions"
          placeholder="Enter any special instructions"
          className="mb-4.5 w-full"
          value={registeredStudent.specialInstructions}
          onChange={(e) => handleRegisterStudentFormChange('specialInstructions', e.target.value)}
        />

        {/* ── PARTICULARS OF PARENTS/GUARDIAN ──────────────────────────────── */}
        <ShowcaseSection title="PARTICULARS OF PARENTS/GUARDIAN" className="space-y-5.5 !p-6.5 mb-4.5">

          {/* Mother */}
          <div className="mb-6">
            <h4 className="font-semibold mb-4 text-gray-700">MOTHER&apos;S INFORMATION</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Title" name="motherTitle" items={titleOptions} placeholder="Mrs, Ms, etc." value={registeredStudent.motherTitle} onChange={(e) => handleRegisterStudentFormChange('motherTitle', e)} />
              <InputGroup label="Surname" name="motherSurname" type="text" placeholder="Mother's surname" value={registeredStudent.motherSurname} onChange={(e) => handleRegisterStudentFormChange('motherSurname', e.target.value)} />
              <InputGroup label="First Names" name="motherFirstNames" type="text" placeholder="Mother's first names" value={registeredStudent.motherFirstNames} onChange={(e) => handleRegisterStudentFormChange('motherFirstNames', e.target.value)} />
              <InputGroup label="ID Number" name="motherIdNumber" type="text" placeholder="Mother's ID number" value={registeredStudent.motherIdNumber} onChange={(e) => handleRegisterStudentFormChange('motherIdNumber', e.target.value)} />
              <InputGroup label="Occupation" name="motherOccupation" type="text" placeholder="Occupation" value={registeredStudent.motherOccupation} onChange={(e) => handleRegisterStudentFormChange('motherOccupation', e.target.value)} />
              <InputGroup label="Employer" name="motherEmployer" type="text" placeholder="Employer" value={registeredStudent.motherEmployer} onChange={(e) => handleRegisterStudentFormChange('motherEmployer', e.target.value)} />
              <InputGroup label="Work Phone" name="motherWorkPhone" type="text" placeholder="Work phone" value={registeredStudent.motherWorkPhone} onChange={(e) => handleRegisterStudentFormChange('motherWorkPhone', e.target.value)} />
              <InputGroup label="Home Phone" name="motherHomePhone" type="text" placeholder="Home phone" value={registeredStudent.motherHomePhone} onChange={(e) => handleRegisterStudentFormChange('motherHomePhone', e.target.value)} />
              <InputGroup label="Cell Phone" name="motherCell" type="text" placeholder="Cell phone" value={registeredStudent.motherCell} onChange={(e) => handleRegisterStudentFormChange('motherCell', e.target.value)} />
              <InputGroup label="Email" name="motherEmail" type="email" placeholder="Email address" value={registeredStudent.motherEmail} onChange={(e) => handleRegisterStudentFormChange('motherEmail', e.target.value)} />
              <TextAreaGroup label="Home Address" name="motherHomeAddress" placeholder="Home address" value={registeredStudent.motherHomeAddress} onChange={(e) => handleRegisterStudentFormChange('motherHomeAddress', e.target.value)} />
              <TextAreaGroup label="Work Address" name="motherWorkAddress" placeholder="Work address" value={registeredStudent.motherWorkAddress} onChange={(e) => handleRegisterStudentFormChange('motherWorkAddress', e.target.value)} />
            </div>
          </div>

          {/* Father */}
          <div className="mb-6">
            <h4 className="font-semibold mb-4 text-gray-700">FATHER&apos;S INFORMATION</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Title" name="fatherTitle" items={titleOptions} placeholder="Mr, Dr, etc." value={registeredStudent.fatherTitle} onChange={(e) => handleRegisterStudentFormChange('fatherTitle', e)} />
              <InputGroup label="Surname" name="fatherSurname" type="text" placeholder="Father's surname" value={registeredStudent.fatherSurname} onChange={(e) => handleRegisterStudentFormChange('fatherSurname', e.target.value)} />
              <InputGroup label="First Names" name="fatherFirstNames" type="text" placeholder="Father's first names" value={registeredStudent.fatherFirstNames} onChange={(e) => handleRegisterStudentFormChange('fatherFirstNames', e.target.value)} />
              <InputGroup label="ID Number" name="fatherIdNumber" type="text" placeholder="Father's ID number" value={registeredStudent.fatherIdNumber} onChange={(e) => handleRegisterStudentFormChange('fatherIdNumber', e.target.value)} />
              <InputGroup label="Occupation" name="fatherOccupation" type="text" placeholder="Occupation" value={registeredStudent.fatherOccupation} onChange={(e) => handleRegisterStudentFormChange('fatherOccupation', e.target.value)} />
              <InputGroup label="Employer" name="fatherEmployer" type="text" placeholder="Employer" value={registeredStudent.fatherEmployer} onChange={(e) => handleRegisterStudentFormChange('fatherEmployer', e.target.value)} />
              <InputGroup label="Work Phone" name="fatherWorkPhone" type="text" placeholder="Work phone" value={registeredStudent.fatherWorkPhone} onChange={(e) => handleRegisterStudentFormChange('fatherWorkPhone', e.target.value)} />
              <InputGroup label="Home Phone" name="fatherHomePhone" type="text" placeholder="Home phone" value={registeredStudent.fatherHomePhone} onChange={(e) => handleRegisterStudentFormChange('fatherHomePhone', e.target.value)} />
              <InputGroup label="Cell Phone" name="fatherCell" type="text" placeholder="Cell phone" value={registeredStudent.fatherCell} onChange={(e) => handleRegisterStudentFormChange('fatherCell', e.target.value)} />
              <InputGroup label="Email" name="fatherEmail" type="email" placeholder="Email address" value={registeredStudent.fatherEmail} onChange={(e) => handleRegisterStudentFormChange('fatherEmail', e.target.value)} />
              <TextAreaGroup label="Home Address" name="fatherHomeAddress" placeholder="Home address" value={registeredStudent.fatherHomeAddress} onChange={(e) => handleRegisterStudentFormChange('fatherHomeAddress', e.target.value)} />
              <TextAreaGroup label="Work Address" name="fatherWorkAddress" placeholder="Work address" value={registeredStudent.fatherWorkAddress} onChange={(e) => handleRegisterStudentFormChange('fatherWorkAddress', e.target.value)} />
            </div>
          </div>

          {/* Guardian */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-700">GUARDIAN&apos;S INFORMATION (if applicable)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Title" name="guardianTitle" items={titleOptions} placeholder="Mr, Mrs, etc." value={registeredStudent.guardianTitle} onChange={(e) => handleRegisterStudentFormChange('guardianTitle', e)} />
              <InputGroup label="Surname" name="guardianSurname" type="text" placeholder="Guardian's surname" value={registeredStudent.guardianSurname} onChange={(e) => handleRegisterStudentFormChange('guardianSurname', e.target.value)} />
              <InputGroup label="First Names" name="guardianFirstNames" type="text" placeholder="Guardian's first names" value={registeredStudent.guardianFirstNames} onChange={(e) => handleRegisterStudentFormChange('guardianFirstNames', e.target.value)} />
              <InputGroup label="ID Number" name="guardianIdNumber" type="text" placeholder="Guardian's ID number" value={registeredStudent.guardianIdNumber} onChange={(e) => handleRegisterStudentFormChange('guardianIdNumber', e.target.value)} />
              <InputGroup label="Occupation" name="guardianOccupation" type="text" placeholder="Occupation" value={registeredStudent.guardianOccupation} onChange={(e) => handleRegisterStudentFormChange('guardianOccupation', e.target.value)} />
              <InputGroup label="Employer" name="guardianEmployer" type="text" placeholder="Employer" value={registeredStudent.guardianEmployer} onChange={(e) => handleRegisterStudentFormChange('guardianEmployer', e.target.value)} />
              <InputGroup label="Work Phone" name="guardianWorkPhone" type="text" placeholder="Work phone" value={registeredStudent.guardianWorkPhone} onChange={(e) => handleRegisterStudentFormChange('guardianWorkPhone', e.target.value)} />
              <InputGroup label="Home Phone" name="guardianHomePhone" type="text" placeholder="Home phone" value={registeredStudent.guardianHomePhone} onChange={(e) => handleRegisterStudentFormChange('guardianHomePhone', e.target.value)} />
              <InputGroup label="Cell Phone" name="guardianCell" type="text" placeholder="Cell phone" value={registeredStudent.guardianCell} onChange={(e) => handleRegisterStudentFormChange('guardianCell', e.target.value)} />
              <InputGroup label="Email" name="guardianEmail" type="email" placeholder="Email address" value={registeredStudent.guardianEmail} onChange={(e) => handleRegisterStudentFormChange('guardianEmail', e.target.value)} />
              <TextAreaGroup label="Home Address" name="guardianHomeAddress" placeholder="Home address" value={registeredStudent.guardianHomeAddress} onChange={(e) => handleRegisterStudentFormChange('guardianHomeAddress', e.target.value)} />
              <TextAreaGroup label="Work Address" name="guardianWorkAddress" placeholder="Work address" value={registeredStudent.guardianWorkAddress} onChange={(e) => handleRegisterStudentFormChange('guardianWorkAddress', e.target.value)} />
            </div>
          </div>
        </ShowcaseSection>

        {/* ── ADDITIONAL INFORMATION ────────────────────────────────────────── */}
        <ShowcaseSection title="ADDITIONAL INFORMATION" className="space-y-5.5 !p-6.5 mb-4.5">
          <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
            <Select
              label="MARITAL STATUS OF PARENTS"
              name="maritalStatus"
              placeholder="Select Marital Status"
              className="w-full"
              items={[
                { label: "MARRIED", value: "MARRIED" },
                { label: "SINGLE", value: "SINGLE" },
                { label: "DIVORCED", value: "DIVORCED" },
                { label: "SEPARATED", value: "SEPARATED" },
                { label: "WIDOWED", value: "WIDOWED" },
              ]}
              value={registeredStudent.maritalStatus}
              onChange={(value: string) => handleRegisterStudentFormChange('maritalStatus', value)}
            />
            <RelationsMultiSelect
              label="WITH WHOM DOES THE CHILD LIVE?"
              id="childliveswithmultiselect"
              name="livesWith"
              placeholder="Select who the child lives with"
              value={registeredStudent.livesWith}
              onChange={(value: string[]) => handleRegisterStudentFormChange('livesWith', value)}
            />
          </div>
        </ShowcaseSection>

        {/* Submit button — disabled if a duplicate is detected or ID is invalid */}
        <button
          type="submit"
          disabled={isSubmitting || emailValidation.state === 'taken' || phoneValidation.state === 'taken' || (idValidation !== null && !idValidation.valid)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90 disabled:opacity-70 disabled:cursor-not-allowed transition-opacity"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Registering...
            </>
          ) : idValidation !== null && !idValidation.valid ? (
            '⚠ Invalid ID Number — Please Fix Before Submitting'
          ) : emailValidation.state === 'taken' ? (
            '⚠ Duplicate Email — Please Fix Before Submitting'
          ) : phoneValidation.state === 'taken' ? (
            '⚠ Duplicate Phone Number — Please Fix Before Submitting'
          ) : (
            'Register Student'
          )}
        </button>

      </form>
    </ShowcaseSection>
  );
}