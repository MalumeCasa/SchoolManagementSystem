'use client'

import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { Select } from "@/components/FormElements/select";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { ShowcaseSectionDesc } from "@/components/Layouts/showcase-section";
import LangaugeMultiSelect, { languageOptions } from "@components/FormElements/MultiSelect/LangaugeMultiSelect";
import RelationsMultiSelect from "@/components/FormElements/MultiSelect/RelationsMultiSelect";
import { registerStudent } from "@api/student-actions";
import { useState, useEffect } from 'react';
import { getRegisteredStudentByIdNumber } from '@api/student-actions';

interface RegisterStudentFormState {
  idNumber: string;
  surname: string;
  firstName: string;
  prefferedName: string;
  dateOfBirth?: string;
  sex?: string;
  homeLanguage?: string[];
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

export function RegisterStudentForm() {

  //Relationship Options
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

  // Title options
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
    religion: '',
    numberOfChildrenInFamily: 0,
    positionInFamily: 0,
    authorizedToBring: [],
    authorizedToCollect: [],
    previousSchool: '',
    intendedPrimarySchool: '',
    careRequired: '',
    dateOfEnrolment: '',
    ageAtEnrolment: 0,
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
  })

  const [isLoading, setIsLoading] = useState(false);
  const [studentFound, setStudentFound] = useState<boolean | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  // Function to handle ID number change and search
  const handleIdNumberChange = async (idNumber: string) => {
    setRegisteredStudent(prev => ({
      ...prev,
      idNumber,
    }));

    // Only search if ID number is not empty and has reasonable length
    if (idNumber.length >= 6) {
      setIsLoading(true);
      setSearchAttempted(true);
      try {
        const student = await getRegisteredStudentByIdNumber(idNumber);

        if (student) {
          setRegisteredStudent(prev => ({
            ...prev,
            idNumber: student.idNumber || '',
            surname: student.surname || '',
            firstName: student.name || '',
            prefferedName: student.preferredName || '',
            dateOfBirth: student.dateOfBirth || '',
            sex: student.sex || '',
            homeLanguage: student.homeLanguage
              ? (Array.isArray(student.homeLanguage)
                ? student.homeLanguage
                : [student.homeLanguage])
              : [],
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
          setStudentFound(true);
        } else {
          setStudentFound(false);
        }
      } catch (error) {
        console.error('Error fetching student:', error);
        setStudentFound(false);
      }
      setIsLoading(false);
    } else {
      setStudentFound(null);
      setSearchAttempted(false);
    }
  };

  // Debounce the ID number search to avoid too many API calls
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (registeredStudent.idNumber) {
        handleIdNumberChange(registeredStudent.idNumber);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [registeredStudent.idNumber]);

  const handleRegisterStudentFormChange = (field: keyof RegisterStudentFormState, value: string | string[] | number) => {
    setRegisteredStudent(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Status display component
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
      return (
        <div className="mt-2">
          <span className="text-sm text-gray-500">
            Enter 6 or more characters to search
          </span>
        </div>
      );
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
    <ShowcaseSection
      title="Register Student Form"
      className="!p-6.5"
    >
      <form action={registerStudent}>
        {/* PARTICULARS OF CHILD */}
        <ShowcaseSection
          title="PARTICULARS OF CHILD"
          className="space-y-5.5 !p-6.5 mb-4.5"
        >

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

          <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
            <Select
              label="RELIGION"
              name="religion"
              placeholder="SELECT RELIGION"
              className="w-full xl:w-full"
              items={
                [
                  { label: "CHRISTIANITY", value: "CHRISTIANITY" },
                  { label: "ISLAM", value: "ISLAM" },
                  { label: "HINDUISM", value: "HINDUISM" },
                  { label: "BUDDHISM", value: "BUDDHISM" },
                  { label: "JUDAISM", value: "JUDAISM" },
                  { label: "OTHER", value: "OTHER" },
                ]
              }
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

          <ShowcaseSection
            title="PLEASE INDICATE THE CARE REQUIRED"
            className="space-y-5.5 !p-4"
          >
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
              placeholder="Age at enrollment"
              className="w-full xl:w-1/2"
              value={registeredStudent.ageAtEnrolment !== undefined ? String(registeredStudent.ageAtEnrolment) : undefined}
              onChange={(e) => handleRegisterStudentFormChange('ageAtEnrolment', parseInt(e.target.value) || '')}
            />
          </div>
        </ShowcaseSection>

        {/* CONTACT PERSON OTHER THAN PARENTS */}
        <ShowcaseSectionDesc
          title="CONTACT PERSON OTHER THAN PARENTS"
          className="space-y-5.5 !p-6.5 mb-4.5"
          description="In case of an emergency a responsible person should be on standby."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Friend Column */}
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

            {/* Next of Kin Column */}
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

        {/* TRANSPORT */}
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

        {/* PARENTS/GUARDIAN PARTICULARS */}
        <ShowcaseSection
          title="PARTICULARS OF PARENTS/GUARDIAN"
          className="space-y-5.5 !p-6.5 mb-4.5"
        >
          {/* Mother Information */}
          <div className="mb-6">
            <h4 className="font-semibold mb-4 text-gray-700">MOTHER&apos;S INFORMATION</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Title"
                name="motherTitle"
                items={titleOptions}
                placeholder="Mrs, Ms, etc."
                value={registeredStudent.motherTitle}
                onChange={(e) => handleRegisterStudentFormChange('motherTitle', e)}
              />

              <InputGroup
                label="Surname"
                name="motherSurname"
                type="text"
                placeholder="Mother's surname"
                value={registeredStudent.motherSurname}
                onChange={(e) => handleRegisterStudentFormChange('motherSurname', e.target.value)}
              />

              <InputGroup
                label="First Names"
                name="motherFirstNames"
                type="text"
                placeholder="Mother's first names"
                value={registeredStudent.motherFirstNames}
                onChange={(e) => handleRegisterStudentFormChange('motherFirstNames', e.target.value)}
              />

              <InputGroup
                label="ID Number"
                name="motherIdNumber"
                type="text"
                placeholder="Mother's ID number"
                value={registeredStudent.motherIdNumber}
                onChange={(e) => handleRegisterStudentFormChange('motherIdNumber', e.target.value)}
              />

              <InputGroup
                label="Occupation"
                name="motherOccupation"
                type="text"
                placeholder="Occupation"
                value={registeredStudent.motherOccupation}
                onChange={(e) => handleRegisterStudentFormChange('motherOccupation', e.target.value)}
              />

              <InputGroup
                label="Employer"
                name="motherEmployer"
                type="text"
                placeholder="Employer"
                value={registeredStudent.motherEmployer}
                onChange={(e) => handleRegisterStudentFormChange('motherEmployer', e.target.value)}
              />

              <InputGroup
                label="Work Phone"
                name="motherWorkPhone"
                type="text"
                placeholder="Work phone"
                value={registeredStudent.motherWorkPhone}
                onChange={(e) => handleRegisterStudentFormChange('motherWorkPhone', e.target.value)}
              />

              <InputGroup
                label="Home Phone"
                name="motherHomePhone"
                type="text"
                placeholder="Home phone"
                value={registeredStudent.motherHomePhone}
                onChange={(e) => handleRegisterStudentFormChange('motherHomePhone', e.target.value)}
              />

              <InputGroup
                label="Cell Phone"
                name="motherCell"
                type="text"
                placeholder="Cell phone"
                value={registeredStudent.motherCell}
                onChange={(e) => handleRegisterStudentFormChange('motherCell', e.target.value)}
              />

              <InputGroup
                label="Email"
                name="motherEmail"
                type="email"
                placeholder="Email address"
                value={registeredStudent.motherEmail}
                onChange={(e) => handleRegisterStudentFormChange('motherEmail', e.target.value)}
              />

              <TextAreaGroup
                label="Home Address"
                name="motherHomeAddress"
                placeholder="Home address"
                value={registeredStudent.motherHomeAddress}
                onChange={(e) => handleRegisterStudentFormChange('motherHomeAddress', e.target.value)}
              />

              <TextAreaGroup
                label="Work Address"
                name="motherWorkAddress"
                placeholder="Work address"
                value={registeredStudent.motherWorkAddress}
                onChange={(e) => handleRegisterStudentFormChange('motherWorkAddress', e.target.value)}
              />
            </div>
          </div>

          {/* Father Information */}
          <div className="mb-6">
            <h4 className="font-semibold mb-4 text-gray-700">FATHER&apos;S INFORMATION</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Title"
                name="fatherTitle"
                items={titleOptions}
                placeholder="Mr, Dr, etc."
                value={registeredStudent.fatherTitle}
                onChange={(e) => handleRegisterStudentFormChange('fatherTitle', e)}
              />

              <InputGroup
                label="Surname"
                name="fatherSurname"
                type="text"
                placeholder="Father's surname"
                value={registeredStudent.fatherSurname}
                onChange={(e) => handleRegisterStudentFormChange('fatherSurname', e.target.value)}
              />

              <InputGroup
                label="First Names"
                name="fatherFirstNames"
                type="text"
                placeholder="Father's first names"
                value={registeredStudent.fatherFirstNames}
                onChange={(e) => handleRegisterStudentFormChange('fatherFirstNames', e.target.value)}
              />

              <InputGroup
                label="ID Number"
                name="fatherIdNumber"
                type="text"
                placeholder="Father's ID number"
                value={registeredStudent.fatherIdNumber}
                onChange={(e) => handleRegisterStudentFormChange('fatherIdNumber', e.target.value)}
              />

              <InputGroup
                label="Occupation"
                name="fatherOccupation"
                type="text"
                placeholder="Occupation"
                value={registeredStudent.fatherOccupation}
                onChange={(e) => handleRegisterStudentFormChange('fatherOccupation', e.target.value)}
              />

              <InputGroup
                label="Employer"
                name="fatherEmployer"
                type="text"
                placeholder="Employer"
                value={registeredStudent.fatherEmployer}
                onChange={(e) => handleRegisterStudentFormChange('fatherEmployer', e.target.value)}
              />

              <InputGroup
                label="Work Phone"
                name="fatherWorkPhone"
                type="text"
                placeholder="Work phone"
                value={registeredStudent.fatherWorkPhone}
                onChange={(e) => handleRegisterStudentFormChange('fatherWorkPhone', e.target.value)}
              />

              <InputGroup
                label="Home Phone"
                name="fatherHomePhone"
                type="text"
                placeholder="Home phone"
                value={registeredStudent.fatherHomePhone}
                onChange={(e) => handleRegisterStudentFormChange('fatherHomePhone', e.target.value)}
              />

              <InputGroup
                label="Cell Phone"
                name="fatherCell"
                type="text"
                placeholder="Cell phone"
                value={registeredStudent.fatherCell}
                onChange={(e) => handleRegisterStudentFormChange('fatherCell', e.target.value)}
              />

              <InputGroup
                label="Email"
                name="fatherEmail"
                type="email"
                placeholder="Email address"
                value={registeredStudent.fatherEmail}
                onChange={(e) => handleRegisterStudentFormChange('fatherEmail', e.target.value)}
              />

              <TextAreaGroup
                label="Home Address"
                name="fatherHomeAddress"
                placeholder="Home address"
                value={registeredStudent.fatherHomeAddress}
                onChange={(e) => handleRegisterStudentFormChange('fatherHomeAddress', e.target.value)}
              />

              <TextAreaGroup
                label="Work Address"
                name="fatherWorkAddress"
                placeholder="Work address"
                value={registeredStudent.fatherWorkAddress}
                onChange={(e) => handleRegisterStudentFormChange('fatherWorkAddress', e.target.value)}
              />

            </div>
          </div>

          {/* Guardian Information */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-700">GUARDIAN&apos;S INFORMATION (if applicable)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Title"
                name="guardianTitle"
                items={titleOptions}
                placeholder="Mr, Mrs, etc."
                value={registeredStudent.guardianTitle}
                onChange={(e) => handleRegisterStudentFormChange('guardianTitle', e)}
              />

              <InputGroup
                label="Surname"
                name="guardianSurname"
                type="text"
                placeholder="Guardian's surname"
                value={registeredStudent.guardianSurname}
                onChange={(e) => handleRegisterStudentFormChange('guardianSurname', e.target.value)}
              />

              <InputGroup
                label="First Names"
                name="guardianFirstNames"
                type="text"
                placeholder="Guardian's first names"
                value={registeredStudent.guardianFirstNames}
                onChange={(e) => handleRegisterStudentFormChange('guardianFirstNames', e.target.value)}
              />

              <InputGroup
                label="ID Number"
                name="guardianIdNumber"
                type="text"
                placeholder="Guardian's ID number"
                value={registeredStudent.guardianIdNumber}
                onChange={(e) => handleRegisterStudentFormChange('guardianIdNumber', e.target.value)}
              />

              <InputGroup
                label="Occupation"
                name="guardianOccupation"
                type="text"
                placeholder="Occupation"
                value={registeredStudent.guardianOccupation}
                onChange={(e) => handleRegisterStudentFormChange('guardianOccupation', e.target.value)}
              />

              <InputGroup
                label="Employer"
                name="guardianEmployer"
                type="text"
                placeholder="Employer"
                value={registeredStudent.guardianEmployer}
                onChange={(e) => handleRegisterStudentFormChange('guardianEmployer', e.target.value)}
              />

              <InputGroup
                label="Work Phone"
                name="guardianWorkPhone"
                type="text"
                placeholder="Work phone"
                value={registeredStudent.guardianWorkPhone}
                onChange={(e) => handleRegisterStudentFormChange('guardianWorkPhone', e.target.value)}
              />

              <InputGroup
                label="Home Phone"
                name="guardianHomePhone"
                type="text"
                placeholder="Home phone"
                value={registeredStudent.guardianHomePhone}
                onChange={(e) => handleRegisterStudentFormChange('guardianHomePhone', e.target.value)}
              />

              <InputGroup
                label="Cell Phone"
                name="guardianCell"
                type="text"
                placeholder="Cell phone"
                value={registeredStudent.guardianCell}
                onChange={(e) => handleRegisterStudentFormChange('guardianCell', e.target.value)}
              />

              <InputGroup
                label="Email"
                name="guardianEmail"
                type="email"
                placeholder="Email address"
                value={registeredStudent.guardianEmail}
                onChange={(e) => handleRegisterStudentFormChange('guardianEmail', e.target.value)}
              />

              <TextAreaGroup
                label="Home Address"
                name="guardianHomeAddress"
                placeholder="Home address"
                value={registeredStudent.guardianHomeAddress}
                onChange={(e) => handleRegisterStudentFormChange('guardianHomeAddress', e.target.value)}
              />

              <TextAreaGroup
                label="Work Address"
                name="guardianWorkAddress"
                placeholder="Work address"
                value={registeredStudent.guardianWorkAddress}
                onChange={(e) => handleRegisterStudentFormChange('guardianWorkAddress', e.target.value)}
              />

            </div>
          </div>
        </ShowcaseSection>

        {/* ADDITIONAL INFORMATION */}
        <ShowcaseSection
          title="ADDITIONAL INFORMATION"
          className="space-y-5.5 !p-6.5 mb-4.5"
        >
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

        <button
          type="submit"
          className="mt-6 flex w-full justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90"
        >
          Register Student
        </button>
      </form>
    </ShowcaseSection>
  );
}