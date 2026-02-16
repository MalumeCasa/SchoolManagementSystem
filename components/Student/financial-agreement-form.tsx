"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { ShowcaseSectionDesc } from "@/components/Layouts/showcase-section";
import { Checkbox } from "@/components/FormElements/checkbox";

import { updateStudentConsent } from "@api/student-actions";

import { useState, useEffect } from 'react';
import { getRegisteredStudentByIdNumber, updateRegisteredStudentMedicalForm } from '@api/student-actions';

interface FinancialAgreementFormState {
  idNumber: string;
  financialAgreedTerms: boolean;
  financialAgreedLiability: boolean;
  financialAgreedCancellation: boolean;

  motherSurname: string;
  motherFirstNames: string;
  motherFinancialDate: string;

  fatherSurname: string;
  fatherFirstNames: string;
  fatherFinancialDate: string;

  monthlyAmount: number;
  paymentDate: number;

}


export function FinancialAgreementPage() {
  const [financialAgreement, setFinancialAgreement] = useState<FinancialAgreementFormState>({
    idNumber: '',
    financialAgreedTerms: false,
    financialAgreedLiability: false,
    financialAgreedCancellation: false,

    motherSurname: '',
    motherFirstNames: '',
    motherFinancialDate: '',

    fatherSurname: '',
    fatherFirstNames: '',
    fatherFinancialDate: '',
    monthlyAmount: 0,
    paymentDate: 0,

  })

  const [isLoading, setIsLoading] = useState(false);
  const [studentFound, setStudentFound] = useState<boolean | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  // Function to handle ID number change and search
  const handleIdNumberChange = async (idNumber: string) => {
    setFinancialAgreement(prev => ({
      ...prev,
      idNumber: prev.idNumber,
      financialAgreedCancellation: prev.financialAgreedCancellation,
      financialAgreedLiability: prev.financialAgreedLiability,
      financialAgreedTerms: prev.financialAgreedTerms,

      motherSurname: prev.motherSurname,
      motherFirstNames: prev.motherFirstNames,
      motherFinancialDate: prev.motherFinancialDate,

      fatherSurname: prev.fatherSurname,
      fatherFirstNames: prev.fatherFirstNames,
      fatherFinancialDate: prev.fatherFinancialDate,
      monthlyAmount: prev.monthlyAmount,
      paymentDate: prev.paymentDate,

    }));

    // Only search if ID number is not empty and has reasonable length
    if (idNumber && idNumber.length >= 6) {
      setIsLoading(true);
      setSearchAttempted(true);
      try {
        const student = await getRegisteredStudentByIdNumber(idNumber);

        if (student) {
          // Student found - populate the fields and disable them
          setFinancialAgreement(prev => ({
            ...prev,
            idNumber: student.idNumber || '',
            financialAgreedTerms: student.financialAgreedTerms || false,
            financialAgreedLiability: student.financialAgreedLiability || false,
            financialAgreedCancellation: student.financialAgreedCancellation || false,

            motherSurname: student.motherSurname || '',
            motherFirstNames: student.motherFirstNames || '',
            motherFinancialDate: student.motherFinancialDate || '',

            fatherSurname: student.fatherSurname || '',
            fatherFirstNames: student.fatherFirstNames || '',
            fatherFinancialDate: student.fatherFinancialDate || '',
            monthlyAmount: student.monthlyAmount || 0,
            paymentDate: student.paymentDate || 0,

          }));
          setStudentFound(true);
        } else {
          // Student not found - clear and enable fields
          setFinancialAgreement(prev => ({
            ...prev,
            idNumber: prev.idNumber,
            financialAgreedCancellation: prev.financialAgreedCancellation,
            financialAgreedLiability: prev.financialAgreedLiability,
            financialAgreedTerms: prev.financialAgreedTerms,

            motherSurname: prev.motherSurname,
            motherFirstNames: prev.motherFirstNames,
            motherFinancialDate: prev.motherFinancialDate,

            fatherSurname: prev.fatherSurname,
            fatherFirstNames: prev.fatherFirstNames,
            fatherFinancialDate: prev.fatherFinancialDate,

            monthlyAmount: prev.monthlyAmount,
            paymentDate: prev.paymentDate,
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
      setFinancialAgreement(prev => ({
        ...prev,
        idNumber: prev.idNumber,
        financialAgreedCancellation: prev.financialAgreedCancellation,
        financialAgreedLiability: prev.financialAgreedLiability,
        financialAgreedTerms: prev.financialAgreedTerms,

        motherSurname: prev.motherSurname,
        motherFirstNames: prev.motherFirstNames,
        motherFinancialDate: prev.motherFinancialDate,

        fatherSurname: prev.fatherSurname,
        fatherFirstNames: prev.fatherFirstNames,
        fatherFinancialDate: prev.fatherFinancialDate,

        monthlyAmount: prev.monthlyAmount,
        paymentDate: prev.paymentDate,
      }));
      setStudentFound(null);
      setSearchAttempted(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (financialAgreement.idNumber) {
        handleIdNumberChange(financialAgreement.idNumber);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [financialAgreement.idNumber]);


  const handleFinancialAgreementFormChange = (field: keyof FinancialAgreementFormState, value: string | boolean) => {
    setFinancialAgreement(prev => ({
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

    <>
      <form action={updateStudentConsent}>
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">FINANCIAL AGREEMENT</h1>
            <p className="text-gray-600">KIDDIES TOWN ECD AND ACADEMY</p>
            <p className="text-sm text-gray-500">7 Grimm Street, Ster Park, Polokwane, 0700</p>
          </div>

          {/* Important Notice */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <div>
                <h3 className="font-bold text-red-700 text-lg mb-2">IMPORTANT NOTICE</h3>
                <p className="text-red-700">
                  Please read this agreement carefully before signing. By signing below, you agree to all terms and conditions outlined in this financial agreement.
                </p>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <ShowcaseSection
            title="TERMS AND CONDITIONS"
            className="space-y-5.5 !p-6.5 mb-6"
          >
            <div className="space-y-4 text-sm text-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Administration Fee</p>
                      <p>Non-refundable fee of <strong>R600</strong> payable upon registration or re-enrolment each year.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Payment Schedule</p>
                      <p>School fees payable over 12 months (January to December). <strong>No November notices for December.</strong></p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Skipped Months</p>
                      <p>Re-registration fee of <strong>R1000</strong> applies for any skipped month, plus outstanding fees.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">4</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">No Refunds</p>
                      <p><strong>No refunds</strong> on any monies paid, including advance payments and annual fees.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">5</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Absence Policy</p>
                      <p>Full fees payable during absence (sickness, holidays, etc.).</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">6</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Payment Deadline</p>
                      <p><strong>Fees due before 1st</strong> of each month. Penalties after 7th.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">7</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Account Management</p>
                      <p>Only Financial Officer can grant payment arrangements.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">8</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Receipts</p>
                      <p><strong>No receipt = No payment.</strong> Keep all proof of payment.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">9</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Legal Action</p>
                      <p>Accounts in arrears may be handed to attorneys with additional costs.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">10</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Cancellation</p>
                      <p>One calendar month written notice required for withdrawal.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ShowcaseSection>

          {/* Fee Structure */}
          <ShowcaseSection
            title="2025 FEE STRUCTURE"
            className="space-y-5.5 !p-6.5 mb-6"
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-left font-semibold">Service Type</th>
                    <th className="border border-gray-300 p-3 text-left font-semibold">Age Group</th>
                    <th className="border border-gray-300 p-3 text-left font-semibold">Details</th>
                    <th className="border border-gray-300 p-3 text-right font-semibold">Monthly Fee</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-medium">Full Day Care</td>
                    <td className="border border-gray-300 p-3">2 – 5 Years</td>
                    <td className="border border-gray-300 p-3">Full day program</td>
                    <td className="border border-gray-300 p-3 text-right font-bold text-green-600">R 2,800</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-medium">Babies Care</td>
                    <td className="border border-gray-300 p-3">Up to 23 Months</td>
                    <td className="border border-gray-300 p-3">Infant care program</td>
                    <td className="border border-gray-300 p-3 text-right font-bold text-green-600">R 3,100</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-medium">Half Day Care</td>
                    <td className="border border-gray-300 p-3">2 – 5 Years</td>
                    <td className="border border-gray-300 p-3">Ends at 13:00 PM</td>
                    <td className="border border-gray-300 p-3 text-right font-bold text-green-600">R 2,200</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-medium">Half Day Babies</td>
                    <td className="border border-gray-300 p-3">Up to 23 Months</td>
                    <td className="border border-gray-300 p-3">Ends at 13:00 PM</td>
                    <td className="border border-gray-300 p-3 text-right font-bold text-green-600">R 2,500</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-medium">Day Visit (Babies)</td>
                    <td className="border border-gray-300 p-3">All Ages</td>
                    <td className="border border-gray-300 p-3">Per day rate</td>
                    <td className="border border-gray-300 p-3 text-right font-bold text-blue-600">R 220</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-medium">Day Visit (Toddlers)</td>
                    <td className="border border-gray-300 p-3">All Ages</td>
                    <td className="border border-gray-300 p-3">Per day rate</td>
                    <td className="border border-gray-300 p-3 text-right font-bold text-blue-600">R 200</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-medium">Aftercare</td>
                    <td className="border border-gray-300 p-3">All Ages</td>
                    <td className="border border-gray-300 p-3">Snacks & Homework assistance included</td>
                    <td className="border border-gray-300 p-3 text-right font-bold text-purple-600">R 950</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-yellow-50 p-4 rounded border border-yellow-200 mt-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Additional Information</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Local school transport available at fair price</li>
                <li>• No cheques accepted</li>
                <li>• Fees reviewed annually with written notice</li>
              </ul>
            </div>
          </ShowcaseSection>

          {/* Bank Details */}
          <ShowcaseSectionDesc
            title="BANKING DETAILS"
            className="space-y-5.5 !p-6.5 mb-6"
            description="Please use the following accounts for your payments. Always include your child&apos;s name as reference."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">N</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-800 text-lg">NEDBANK</h3>
                    <p className="text-blue-600 text-sm">Business Account</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Number:</span>
                    <span className="font-mono font-bold">110 679 2211</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Branch Code:</span>
                    <span className="font-mono font-bold">17 046 859 05</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Type:</span>
                    <span className="font-semibold">Current Account</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-5 rounded-lg border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-green-800 text-lg">STANDARD BANK</h3>
                    <p className="text-green-600 text-sm">Business Account</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Number:</span>
                    <span className="font-mono font-bold">1013 675 3726</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Branch Code:</span>
                    <span className="font-mono font-bold">051001</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Type:</span>
                    <span className="font-semibold">Current Account</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded border border-purple-200 mt-4">
              <div className="text-center">
                <p className="font-semibold text-purple-800 mb-2">PROOF OF PAYMENT SUBMISSION</p>
                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600">📧</span>
                    <span className="text-sm">admin@kiddiestown.co.za</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600">💬</span>
                    <span className="text-sm">WhatsApp: 081 545 3500</span>
                  </div>
                </div>
              </div>
            </div>
          </ShowcaseSectionDesc>

          {/* Agreement Form */}
          <ShowcaseSection
            title="FINANCIAL AGREEMENT DECLARATION"
            className="space-y-5.5 !p-6.5 mb-6"
          >
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <div className="space-y-4 text-sm mb-6">

                <InputGroup
                  name="idNumber"
                  placeholder="Enter Student ID Number"
                  label="Student ID Number"
                  type="text"
                  value={financialAgreement.idNumber}
                  onChange={(e) => handleFinancialAgreementFormChange('idNumber', e.target.value)}
                />

                <StatusIndicator />

                <p>
                  I, the undersigned, hereby acknowledge that I have read and understood all the terms and conditions
                  of this Financial Agreement and agree to be bound by them.
                </p>
                <div className="flex items-start gap-2">
                  <Checkbox
                    label=""
                    name="financialAgreedTerms"
                    withIcon="check"
                    onChange={(e) => handleFinancialAgreementFormChange('financialAgreedTerms', e.target.checked)}
                    checked={financialAgreement.financialAgreedTerms}
                  />

                  <label htmlFor="financialAgreedTerms" className="text-sm font-medium">
                    I understand that I am fully responsible for the account and that all school fees are to be paid
                    by the 3rd of each month. Late payments after the 7th will incur penalties and may result in
                    legal action.
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    label=""
                    name="financialAgreedLiability"
                    withIcon="check"
                    checked={financialAgreement.financialAgreedLiability}
                    onChange={(e) => handleFinancialAgreementFormChange('financialAgreedLiability', e.target.checked)}
                  />

                  <label htmlFor="financialAgreedLiability" className="text-sm font-medium">
                    I understand that the school has the right to suspend services and request withdrawal of my child
                    if the account is in arrears, and I will still be liable for all outstanding fees including
                    legal costs.
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    label=""
                    name="financialAgreedCancellation"
                    withIcon="check"
                    checked={financialAgreement.financialAgreedCancellation}
                    onChange={(e) => handleFinancialAgreementFormChange('financialAgreedCancellation', e.target.checked)}
                  />

                  <label htmlFor="financialAgreedCancellation" className="text-sm font-medium">
                    I understand that a full calendar month&apos;s written notice is required for withdrawal and that
                    this agreement cannot be cancelled within the first 3 months without valid reason.
                  </label>
                </div>
              </div>

              {/* Parent Signatures */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Mother's Signature */}
                <div className="border border-gray-300 rounded-lg p-4">
                  <h4 className="font-semibold text-center mb-4 text-gray-700">MOTHER&apos;S DECLARATION</h4>
                  <InputGroup
                    label="Surname"
                    type="text"
                    name="motherSurname"
                    placeholder="Enter mother's surnames"
                    className="mb-4"
                    value={financialAgreement.motherSurname}
                    onChange={(e) => handleFinancialAgreementFormChange('motherSurname', e.target.value)}
                    disabled
                  />

                  <InputGroup
                    label="Full Names"
                    type="text"
                    name="motherFirstNames"
                    placeholder="Enter mother's full names"
                    className="mb-4"
                    value={financialAgreement.motherFirstNames}
                    onChange={(e) => handleFinancialAgreementFormChange('motherFirstNames', e.target.value)}
                    disabled
                  />

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Signature</label>
                    <div className="border border-gray-300 rounded h-24 flex items-center justify-center bg-gray-50">
                      <p className="text-gray-500 text-sm">Sign above this line</p>
                    </div>
                  </div>

                  <InputGroup
                    label="Date"
                    type="date"
                    className="w-full"
                    placeholder=""
                    name="motherFinancialDate"
                    value={financialAgreement.motherFinancialDate}
                    onChange={(e) => handleFinancialAgreementFormChange('motherFinancialDate', e.target.value)}
                  />
                </div>

                {/* Father's Signature */}
                <div className="border border-gray-300 rounded-lg p-4">
                  <h4 className="font-semibold text-center mb-4 text-gray-700">FATHER&apos;S DECLARATION</h4>

                  <InputGroup
                    label="Surname"
                    type="text"
                    placeholder="Enter father's surname"
                    className="mb-4"
                    name="fatherSurname"
                    value={financialAgreement.fatherSurname}
                    onChange={(e) => handleFinancialAgreementFormChange('fatherSurname', e.target.value)}
                    disabled
                  />

                  <InputGroup
                    label="Name"
                    type="text"
                    name="fatherFirstNames"
                    placeholder="Enter father's full names"
                    className="mb-4"
                    value={financialAgreement.fatherFirstNames}
                    onChange={(e) => handleFinancialAgreementFormChange('fatherFirstNames', e.target.value)}
                    disabled
                  />

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Signature</label>
                    <div className="border border-gray-300 rounded h-24 flex items-center justify-center bg-gray-50">
                      <p className="text-gray-500 text-sm">Sign above this line</p>
                    </div>
                  </div>

                  <InputGroup
                    label="Date"
                    type="date"
                    className="w-full"
                    placeholder=""
                    name="fatherFinancialDate"
                    value={financialAgreement.fatherFinancialDate}
                    onChange={(e) => handleFinancialAgreementFormChange('fatherFinancialDate', e.target.value)}
                  />
                </div>
              </div>

              {/* Payment Details */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-4 text-center">PAYMENT DETAILS</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputGroup
                    label="Monthly Amount"
                    type="text"
                    name="monthlyAmount"
                    placeholder="e.g., 2800"
                    className="w-full"
                    value={String(financialAgreement.monthlyAmount)}
                    onChange={(e) =>
                      handleFinancialAgreementFormChange('monthlyAmount', e.target.value)}
                  />

                  <Select
                    label="Payment Date Each Month"
                    items={[
                      { label: "15th", value: "15" },
                      { label: "20th", value: "20" },
                      { label: "25th", value: "25" },
                      { label: "31st", value: "31" },
                    ]}
                    className="w-full"
                    name="paymentDate"
                  //onChange={}
                  />

                </div>
              </div>
            </div>
          </ShowcaseSection>

          {/* Submit Button */}
          <div className="text-center">
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200">
              Submit Financial Agreement
            </button>
            <p className="text-sm text-gray-500 mt-2">
              By clicking submit, you agree to all terms and conditions outlined above
            </p>
          </div>
        </div>
      </form>
    </>
  );
}