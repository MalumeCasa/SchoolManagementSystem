import { useState, useEffect } from 'react';
import { ShowcaseSection } from '@/components/Layouts/showcase-section';
import InputGroup from '@/components/FormElements/InputGroup';
import { getRegisteredStudentByIdNumber, updateRegisteredStudentMedicalForm } from '@api/student-actions';


interface MedicalFormState {
  idNumber: string;
  surname: string;
  firstName: string;
  prefferedName: string;
  familyDoctor: string;
  doctorPhone: string;
  diabetes: boolean;
  asthma: boolean;
  epilepsy: boolean;
  cardiacMurmur: boolean;
  otherConditions: boolean;
  otherConditionsDetails: string;
  childhoodSicknesses: string;
  lifeThreateningAllergies: string;
  otherAllergies: string;
  regularMedications: boolean;
  regularMedicationsDetails: string;
  majorOperations: string;
  behaviorProblems: string;
  speechHearingProblems: string;
  birthComplications: string;
  immunisationUpToDate: boolean;
  familyMedicalHistory: string;
}

interface MedicalConsentState {
  consent1Answer: 'yes' | 'no' | '';
  consent2Answer: 'yes' | 'no' | '';
  maritalStatus: string;
  childLivesWith: string;
  medicalForm: MedicalFormState;
}

export default function MedicalConsentForm() {
  const [medicalConsent, setMedicalConsent] = useState<MedicalConsentState>({
    consent1Answer: '',
    consent2Answer: '',
    maritalStatus: '',
    childLivesWith: '',
    medicalForm: {
      idNumber: '',
      surname: '',
      firstName: '',
      prefferedName: '',
      familyDoctor: '',
      doctorPhone: '',
      diabetes: false,
      asthma: false,
      epilepsy: false,
      cardiacMurmur: false,
      otherConditions: false,
      otherConditionsDetails: '',
      childhoodSicknesses: '',
      lifeThreateningAllergies: '',
      otherAllergies: '',
      regularMedications: false,
      regularMedicationsDetails: '',
      majorOperations: '',
      behaviorProblems: '',
      speechHearingProblems: '',
      birthComplications: '',
      immunisationUpToDate: false,
      familyMedicalHistory: '',
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [studentFound, setStudentFound] = useState<boolean | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  // Function to handle ID number change and search
  const handleIdNumberChange = async (idNumber: string) => {
    setMedicalConsent(prev => ({
      ...prev,
      medicalForm: {
        ...prev.medicalForm,
        idNumber,
      }
    }));

    // Only search if ID number is not empty and has reasonable length
    if (idNumber && idNumber.length >= 6) {
      setIsLoading(true);
      setSearchAttempted(true);
      try {
        const student = await getRegisteredStudentByIdNumber(idNumber);

        if (student) {
          // Student found - populate the fields and disable them
          setMedicalConsent(prev => ({
            ...prev,
            medicalForm: {
              ...prev.medicalForm,
              surname: student.surname || '',
              firstName: student.name || '',
              familyDoctor: student.familyDoctor || '',
              doctorPhone: student.doctorPhone || '',
              childhoodSicknesses: student.childhoodSicknesses || '',
              lifeThreateningAllergies: student.lifeThreateningAllergies || '',

              otherAllergies: student.otherAllergies || '',
              majorOperations: student.majorOperations || '',
              behaviorProblems: student.behaviorProblems || '',
              speechHearingProblems: student.speechHearingProblems || '',
              birthComplications: student.birthComplications || '',
              familyMedicalHistory: student.familyMedicalHistory || '',
              immunisationUpToDate: student.immunisationUpToDate || false,
              regularMedications: student.regularMedications || false,
              regularMedicationsDetails: student.regularMedicationsDetails || '',
            }
          }));
          setStudentFound(true);
        } else {
          // Student not found - clear and enable fields
          setMedicalConsent(prev => ({
            ...prev,
            medicalForm: {
              ...prev.medicalForm,
              surname: '',
              firstName: '',
              prefferedName: '',
            }
          }));
          setStudentFound(false);
        }
      } catch (error) {
        console.error('Error searching for student:', error);
        setStudentFound(false);
      } finally {
        setIsLoading(false);
      }
    } else {
      // If ID number is too short or empty, clear and enable fields
      setMedicalConsent(prev => ({
        ...prev,
        medicalForm: {
          ...prev.medicalForm,
          surname: '',
          firstName: '',
          prefferedName: '',
        }
      }));
      setStudentFound(null);
      setSearchAttempted(false);
    }
  };

  // Debounce the ID number search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (medicalConsent.medicalForm.idNumber && medicalConsent.medicalForm.idNumber.length >= 6) {
        handleIdNumberChange(medicalConsent.medicalForm.idNumber);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [medicalConsent.medicalForm.idNumber]);

  const handleMedicalFormChange = (field: keyof MedicalFormState, value: string | boolean) => {
    setMedicalConsent(prev => ({
      ...prev,
      medicalForm: {
        ...prev.medicalForm,
        [field]: value,
      }
    }));
  };

  const handleMedicalConditionChange = (condition: 'diabetes' | 'asthma' | 'epilepsy' | 'cardiacMurmur' | 'otherConditions') => {
    setMedicalConsent(prev => ({
      ...prev,
      medicalForm: {
        ...prev.medicalForm,
        [condition]: !prev.medicalForm[condition],
      }
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

    if (!searchAttempted || medicalConsent.medicalForm.idNumber.length < 6) {
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
          <span className="text-sm text-yellow-700 font-medium">
            Student not found - please fill in details manually
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <form action={updateRegisteredStudentMedicalForm} className="container mx-auto p-6">
      {/* MEDICAL FORM SECTION */}
      <ShowcaseSection
        title="MEDICAL FORM"
        className="space-y-5.5 !p-6.5 mb-4.5"
      >
        <div className="mb-6">
          <InputGroup
            label="ID NUMBER / PASSPORT NUMBER"
            name="id_number"
            type="text"
            placeholder="Enter ID or passport number"
            className="w-full"
            value={medicalConsent.medicalForm.idNumber}
            onChange={(e) => handleMedicalFormChange('idNumber', e.target.value)}
            required
          />
          <StatusIndicator />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <InputGroup
            label="SURNAME"
            name="surname"
            type="text"
            placeholder="Enter surname"
            className="w-full"
            value={medicalConsent.medicalForm.surname}
            onChange={(e) => handleMedicalFormChange('surname', e.target.value)}
            disabled={studentFound === true}
            required
          />
          <InputGroup
            label="FIRST NAME"
            name="name"
            type="text"
            placeholder="Enter first name"
            className="w-full"
            value={medicalConsent.medicalForm.firstName}
            onChange={(e) => handleMedicalFormChange('firstName', e.target.value)}
            disabled={studentFound === true}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <InputGroup
            label="FAMILY DOCTOR"
            name="familyDoctor"
            type="text"
            placeholder="Enter family doctor name"
            className="w-full"
            value={medicalConsent.medicalForm.familyDoctor}
            onChange={(e) => handleMedicalFormChange('familyDoctor', e.target.value)}
          />
          <InputGroup
            label="DOCTOR TELEPHONE NUMBER"
            name="doctorPhone"
            type="tel"
            placeholder="Enter doctor phone number"
            className="w-full"
            value={medicalConsent.medicalForm.doctorPhone}
            onChange={(e) => handleMedicalFormChange('doctorPhone', e.target.value)}
          />
        </div>

        {/* Medical Conditions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">1. DOES HE/SHE SUFFER FROM:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="diabetes"
                className="h-4 w-4 mr-2"
                checked={medicalConsent.medicalForm.diabetes}
                onChange={() => handleMedicalConditionChange('diabetes')}
              />
              <label className="text-sm font-medium">DIABETES</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="asthma"
                className="h-4 w-4 mr-2"
                checked={medicalConsent.medicalForm.asthma}
                onChange={() => handleMedicalConditionChange('asthma')}
              />
              <label className="text-sm font-medium">ASTHMA</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="epilepsy"
                className="h-4 w-4 mr-2"
                checked={medicalConsent.medicalForm.epilepsy}
                onChange={() => handleMedicalConditionChange('epilepsy')}
              />
              <label className="text-sm font-medium">EPILEPSY</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="cardiac_murmur"
                className="h-4 w-4 mr-2"
                checked={medicalConsent.medicalForm.cardiacMurmur}
                onChange={() => handleMedicalConditionChange('cardiacMurmur')}
              />
              <label className="text-sm font-medium">CARDIAC MURMUR</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="other_conditions"
                className="h-4 w-4 mr-2"
                checked={medicalConsent.medicalForm.otherConditions}
                onChange={() => handleMedicalConditionChange('otherConditions')}
              />
              <label className="text-sm font-medium">OTHER</label>
            </div>
          </div>

          {medicalConsent.medicalForm.otherConditions && (
            <div className="mt-4">
              <InputGroup
                label="DETAILS"
                name="other_conditions_details"
                type="text"
                placeholder="Please provide details"
                className="w-full"
                value={medicalConsent.medicalForm.otherConditionsDetails}
                onChange={(e) => handleMedicalFormChange('otherConditionsDetails', e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Rest of your medical form components... */}
        <div className="mb-6">
          <InputGroup
            label="2. WHAT CHILDHOOD SICKNESSES HAS YOUR CHILD HAD?"
            name="childhoodSicknesses"
            type="text"
            placeholder="List childhood sicknesses"
            className="w-full"
            value={medicalConsent.medicalForm.childhoodSicknesses}
            onChange={(e) => handleMedicalFormChange('childhoodSicknesses', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <InputGroup
            label="3. LIFE THREATENING ALLERGIES"
            name="lifeThreateningAllergies"
            type="text"
            placeholder="List life-threatening allergies"
            className="w-full"
            value={medicalConsent.medicalForm.lifeThreateningAllergies}
            onChange={(e) => handleMedicalFormChange('lifeThreateningAllergies', e.target.value)}
          />
          <InputGroup
            label="4. OTHER ALLERGIES"
            name="otherAllergies"
            type="text"
            placeholder="List other allergies"
            className="w-full"
            value={medicalConsent.medicalForm.otherAllergies}
            onChange={(e) => handleMedicalFormChange('otherAllergies', e.target.value)}
          />
        </div>

        <div className="mb-6">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              name="regularMedications"
              className="h-4 w-4 mr-2"
              checked={medicalConsent.medicalForm.regularMedications}
              onChange={() => handleMedicalFormChange('regularMedications', !medicalConsent.medicalForm.regularMedications)}
            />
            <label className="text-sm font-medium">5. IS YOUR CHILD ON ANY REGULAR MEDICATIONS?</label>
          </div>
          {medicalConsent.medicalForm.regularMedications && (
            <InputGroup
              label="DETAILS"
              name="regularMedicationsDetails"
              type="text"
              placeholder="Please provide medication details"
              className="w-full"
              value={medicalConsent.medicalForm.regularMedicationsDetails}
              onChange={(e) => handleMedicalFormChange('regularMedicationsDetails', e.target.value)}
            />
          )}
        </div>

        <div className="space-y-4 mb-6">
          <InputGroup
            label="6. HAS HE/SHE HAD ANY MAJOR OPERATIONS?"
            name="majorOperations"
            type="text"
            placeholder="List major operations"
            className="w-full"
            value={medicalConsent.medicalForm.majorOperations}
            onChange={(e) => handleMedicalFormChange('majorOperations', e.target.value)}
          />
          <InputGroup
            label="7. ANY BEHAVIOUR PROBLEMS?"
            name="behaviorProblems"
            type="text"
            placeholder="Describe behavior problems"
            className="w-full"
            value={medicalConsent.medicalForm.behaviorProblems}
            onChange={(e) => handleMedicalFormChange('behaviorProblems', e.target.value)}
          />
          <InputGroup
            label="8. ANY SPEECH OR HEARING PROBLEMS?"
            name="speechHearingProblems"
            type="text"
            placeholder="Describe speech or hearing problems"
            className="w-full"
            value={medicalConsent.medicalForm.speechHearingProblems}
            onChange={(e) => handleMedicalFormChange('speechHearingProblems', e.target.value)}
          />
          <InputGroup
            label="9. ANY COMPLICATIONS DURING BIRTH?"
            name="birthComplications"
            type="text"
            placeholder="Describe birth complications"
            className="w-full"
            value={medicalConsent.medicalForm.birthComplications}
            onChange={(e) => handleMedicalFormChange('birthComplications', e.target.value)}
          />
          <div className="flex items-center">
            <input
              type="checkbox"
              name="immunisationUpToDate"
              className="h-4 w-4 mr-2"
              checked={medicalConsent.medicalForm.immunisationUpToDate}
              onChange={(e) => handleMedicalFormChange('immunisationUpToDate', e.target.checked)}
            />
            <label className="text-sm font-medium">10. IS YOUR CHILD&apos;S IMMUNISATION UP TO DATE?</label>
          </div>

          <InputGroup
            label="11. RELEVANT FAMILY HISTORY (EPILEPSY, DEAFNESS, BLINDNESS, ETC)"
            name="familyMedicalHistory"
            type="text"
            placeholder="Describe relevant family history"
            className="w-full"
            value={medicalConsent.medicalForm.familyMedicalHistory}
            onChange={(e) => handleMedicalFormChange('familyMedicalHistory', e.target.value)}
          />
        </div>
      </ShowcaseSection>

      <div className="mt-6">
        <button
          type="submit"
          className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark transition-colors"
        >
          Submit Medical Consent
        </button>
      </div>
    </form>
  );
}