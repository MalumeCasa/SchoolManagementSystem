// components/fees/fee-structure-form.tsx
'use client'

import InputGroup from "@components/FormElements/InputGroup";
import { TextAreaGroup } from "@components/FormElements/InputGroup/text-area";
import { Select } from "@/components/FormElements/select";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { ShowcaseSectionDesc } from "@/components/Layouts/showcase-section";
import { useState, useEffect } from 'react';

interface FeeStructureFormState {
  name: string;
  description: string;
  academicYear: string;
  gradeLevel: string;
  feeType: string;
  amount: number;
  frequency: string;
  dueDate: string;
  isActive: boolean;
  applicableMonths: string[];
  lateFeePenalty: number;
  discountEarlyPayment: number;
  installmentPlan: boolean;
  maxInstallments: number;
}

interface FeeStructureFormProps {
  onSubmit: (data: FeeStructureFormState) => void;
  onCancel?: () => void; // Add this prop
  initialData?: FeeStructureFormState;
  isSubmitting?: boolean;
}

export function FeeStructureForm({ onSubmit, onCancel, initialData, isSubmitting = false }: FeeStructureFormProps) {
  const [feeStructure, setFeeStructure] = useState<FeeStructureFormState>({
    name: '',
    description: '',
    academicYear: new Date().getFullYear().toString(),
    gradeLevel: '',
    feeType: '',
    amount: 0,
    frequency: 'monthly',
    dueDate: '',
    isActive: true,
    applicableMonths: [],
    lateFeePenalty: 0,
    discountEarlyPayment: 0,
    installmentPlan: false,
    maxInstallments: 1,
    ...initialData
  });

  // Grade level options
  const gradeOptions = [
    { value: "PRE_SCHOOL", label: "Pre-School" },
    { value: "GRADE_R", label: "Grade R" },
    { value: "GRADE_1", label: "Grade 1" },
    { value: "GRADE_2", label: "Grade 2" },
    { value: "GRADE_3", label: "Grade 3" },
    { value: "GRADE_4", label: "Grade 4" },
    { value: "GRADE_5", label: "Grade 5" },
    { value: "GRADE_6", label: "Grade 6" },
    { value: "GRADE_7", label: "Grade 7" },
    { value: "ALL", label: "All Grades" }
  ];

  // Fee type options
  const feeTypeOptions = [
    { value: "TUITION", label: "Tuition Fee" },
    { value: "TRANSPORT", label: "Transport Fee" },
    { value: "ACTIVITY", label: "Activity Fee" },
    { value: "SPORTS", label: "Sports Fee" },
    { value: "LIBRARY", label: "Library Fee" },
    { value: "LABORATORY", label: "Laboratory Fee" },
    { value: "REGISTRATION", label: "Registration Fee" },
    { value: "EXAMINATION", label: "Examination Fee" },
    { value: "HOSTEL", label: "Hostel Fee" },
    { value: "UNIFORM", label: "Uniform Fee" },
    { value: "OTHER", label: "Other Fee" }
  ];

  // Frequency options
  const frequencyOptions = [
    { value: "ONE_TIME", label: "One Time" },
    { value: "MONTHLY", label: "Monthly" },
    { value: "QUARTERLY", label: "Quarterly" },
    { value: "TERMLY", label: "Termly" },
    { value: "ANNUAL", label: "Annual" }
  ];

  // Month options
  const monthOptions = [
    { value: "JANUARY", label: "January" },
    { value: "FEBRUARY", label: "February" },
    { value: "MARCH", label: "March" },
    { value: "APRIL", label: "April" },
    { value: "MAY", label: "May" },
    { value: "JUNE", label: "June" },
    { value: "JULY", label: "July" },
    { value: "AUGUST", label: "August" },
    { value: "SEPTEMBER", label: "September" },
    { value: "OCTOBER", label: "October" },
    { value: "NOVEMBER", label: "November" },
    { value: "DECEMBER", label: "December" }
  ];

  const handleFeeStructureChange = (field: keyof FeeStructureFormState, value: string | string[] | number | boolean) => {
    setFeeStructure(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(feeStructure);
  };

  return (
    <ShowcaseSection
      title={initialData ? "Edit Fee Structure" : "Create Fee Structure"}
      className="!p-6.5"
    >
      <form onSubmit={handleSubmit}>
        {/* BASIC INFORMATION */}
        <ShowcaseSection
          title="BASIC INFORMATION"
          className="space-y-5.5 !p-6.5 mb-4.5"
        >
          <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
            <InputGroup
              label="FEE STRUCTURE NAME"
              name="name"
              type="text"
              placeholder="Enter fee structure name"
              className="w-full xl:w-1/2"
              value={feeStructure.name}
              onChange={(e) => handleFeeStructureChange('name', e.target.value)}
              required
            />

            <InputGroup
              label="ACADEMIC YEAR"
              name="academicYear"
              type="text"
              placeholder="e.g., 2024-2025"
              className="w-full xl:w-1/2"
              value={feeStructure.academicYear}
              onChange={(e) => handleFeeStructureChange('academicYear', e.target.value)}
              required
            />
          </div>

          <TextAreaGroup
            label="DESCRIPTION"
            name="description"
            placeholder="Enter fee structure description"
            className="w-full"
            value={feeStructure.description}
            onChange={(e) => handleFeeStructureChange('description', e.target.value)}
          />

          <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
            <Select
              label="GRADE LEVEL"
              name="gradeLevel"
              placeholder="SELECT GRADE LEVEL"
              className="w-full xl:w-1/2"
              items={gradeOptions}
              value={feeStructure.gradeLevel}
              onChange={(value: string) => handleFeeStructureChange('gradeLevel', value)}
              required
            />

            <Select
              label="FEE TYPE"
              name="feeType"
              placeholder="SELECT FEE TYPE"
              className="w-full xl:w-1/2"
              items={feeTypeOptions}
              value={feeStructure.feeType}
              onChange={(value: string) => handleFeeStructureChange('feeType', value)}
              required
            />
          </div>
        </ShowcaseSection>

        {/* FEE DETAILS */}
        <ShowcaseSection
          title="FEE DETAILS"
          className="space-y-5.5 !p-6.5 mb-4.5"
        >
          <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
            <InputGroup
              label="AMOUNT (ZAR)"
              name="amount"
              type="number"
              placeholder="0.00"
              className="w-full xl:w-1/3"
              value={feeStructure.amount !== undefined ? String(feeStructure.amount) : ''}
              onChange={(e) => handleFeeStructureChange('amount', parseFloat(e.target.value) || 0)}
              required
            />

            <Select
              label="FREQUENCY"
              name="frequency"
              placeholder="SELECT FREQUENCY"
              className="w-full xl:w-1/3"
              items={frequencyOptions}
              value={feeStructure.frequency}
              onChange={(value: string) => handleFeeStructureChange('frequency', value)}
              required
            />

            <InputGroup
              label="DUE DATE"
              name="dueDate"
              type="date"
              placeholder="Select due date"
              className="w-full xl:w-1/3"
              value={feeStructure.dueDate}
              onChange={(e) => handleFeeStructureChange('dueDate', e.target.value)}
            />
          </div>

          <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
            <InputGroup
              label="LATE FEE PENALTY (%)"
              name="lateFeePenalty"
              type="number"
              placeholder="0"
              className="w-full xl:w-1/2"
              value={feeStructure.lateFeePenalty !== undefined ? String(feeStructure.lateFeePenalty) : ''}
              onChange={(e) => handleFeeStructureChange('lateFeePenalty', parseFloat(e.target.value) || 0)}
            />

            <InputGroup
              label="EARLY PAYMENT DISCOUNT (%)"
              name="discountEarlyPayment"
              type="number"
              placeholder="0"
              className="w-full xl:w-1/2"
              value={feeStructure.discountEarlyPayment !== undefined ? String(feeStructure.discountEarlyPayment) : ''}
              onChange={(e) => handleFeeStructureChange('discountEarlyPayment', parseFloat(e.target.value) || 0)}
            />
          </div>
        </ShowcaseSection>

        {/* PAYMENT OPTIONS */}
        <ShowcaseSectionDesc
          title="PAYMENT OPTIONS"
          className="space-y-5.5 !p-6.5 mb-4.5"
          description="Configure payment plans and options for this fee structure"
        >
          <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row items-start">
            <div className="flex items-center space-x-2 w-full xl:w-1/2">
              <input
                type="checkbox"
                id="installmentPlan"
                name="installmentPlan"
                checked={feeStructure.installmentPlan}
                onChange={(e) => handleFeeStructureChange('installmentPlan', e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="installmentPlan" className="text-sm font-medium text-gray-700">
                Allow Installment Payments
              </label>
            </div>

            {feeStructure.installmentPlan && (
              <InputGroup
                label="MAXIMUM INSTALLMENTS"
                name="maxInstallments"
                type="number"
                placeholder="1"
                className="w-full xl:w-1/2"
                value={feeStructure.maxInstallments !== undefined ? String(feeStructure.maxInstallments) : ''}
                onChange={(e) => handleFeeStructureChange('maxInstallments', parseInt(e.target.value) || 1)}
              />
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={feeStructure.isActive}
              onChange={(e) => handleFeeStructureChange('isActive', e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active Fee Structure
            </label>
          </div>
        </ShowcaseSectionDesc>

        {/* APPLICABLE MONTHS */}
        <ShowcaseSection
          title="APPLICABLE MONTHS"
          className="space-y-5.5 !p-6.5 mb-4.5"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {monthOptions.map((month) => (
              <div key={month.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={month.value}
                  name="applicableMonths"
                  value={month.value}
                  checked={feeStructure.applicableMonths.includes(month.value)}
                  onChange={(e) => {
                    const updatedMonths = e.target.checked
                      ? [...feeStructure.applicableMonths, month.value]
                      : feeStructure.applicableMonths.filter(m => m !== month.value);
                    handleFeeStructureChange('applicableMonths', updatedMonths);
                  }}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor={month.value} className="text-sm text-gray-700">
                  {month.label}
                </label>
              </div>
            ))}
          </div>
        </ShowcaseSection>

        {/* FORM ACTION BUTTONS */}
        <div className="mt-6 flex gap-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white p-[13px] font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-50"
          >
            {isSubmitting ? 'Saving...' : (initialData ? 'Update Fee Structure' : 'Create Fee Structure')}
          </button>
        </div>
      </form>
    </ShowcaseSection>
  );
}