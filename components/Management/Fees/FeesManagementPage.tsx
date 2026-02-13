// app/fees/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { FeeStructureForm } from "./components/FeeStructureForm";
import { Button } from "@/components/ui/button";

interface FeeStructure {
  id: string;
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

export default function FeesManagementPage({ user }: { user: any }) {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeStructure | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setFeeStructures([
        {
          id: '1',
          name: 'Grade 1 Tuition 2024',
          description: 'Annual tuition fee for Grade 1 students',
          academicYear: '2024',
          gradeLevel: 'GRADE_1',
          feeType: 'TUITION',
          amount: 25000,
          frequency: 'ANNUAL',
          dueDate: '2024-01-31',
          isActive: true,
          applicableMonths: ['JANUARY'],
          lateFeePenalty: 5,
          discountEarlyPayment: 2,
          installmentPlan: true,
          maxInstallments: 10
        },
        {
          id: '2',
          name: 'School Transport Fee',
          description: 'Monthly transport fee for all grades',
          academicYear: '2024',
          gradeLevel: 'ALL',
          feeType: 'TRANSPORT',
          amount: 1200,
          frequency: 'MONTHLY',
          dueDate: '',
          isActive: true,
          applicableMonths: ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER'],
          lateFeePenalty: 3,
          discountEarlyPayment: 0,
          installmentPlan: false,
          maxInstallments: 1
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleCreateFeeStructure = async (data: any) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newFee: FeeStructure = {
        ...data,
        id: (feeStructures.length + 1).toString()
      };
      setFeeStructures(prev => [...prev, newFee]);
      setShowForm(false);
      setIsLoading(false);
    }, 1000);
  };

  const handleUpdateFeeStructure = async (data: any) => {
    if (!editingFee) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setFeeStructures(prev =>
        prev.map(fee =>
          fee.id === editingFee.id ? { ...data, id: editingFee.id } : fee
        )
      );
      setEditingFee(null);
      setShowForm(false);
      setIsLoading(false);
    }, 1000);
  };

  const handleEdit = (fee: FeeStructure) => {
    setEditingFee(fee);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this fee structure?')) {
      setFeeStructures(prev => prev.filter(fee => fee.id !== id));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  if (showForm) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button
            onClick={() => {
              setShowForm(false);
              setEditingFee(null);
            }}
            variant="outline"
            className="mb-4"
          >
            ← Back to Fee Structures
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {editingFee ? 'Edit Fee Structure' : 'Create New Fee Structure'}
          </h1>
        </div>

        <FeeStructureForm
          onSubmit={editingFee ? handleUpdateFeeStructure : handleCreateFeeStructure}
          initialData={editingFee || undefined}
          isSubmitting={isLoading}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fees Management</h1>
          <p className="text-gray-600">Manage fee structures and student payments</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary-dark"
        >
          Create Fee Structure
        </Button>
      </div>

      <ShowcaseSection
        title="Fee Structures"
        className="!p-6.5"
      >
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading fee structures...</p>
          </div>
        ) : feeStructures.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No fee structures found.</p>
            <Button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-primary hover:bg-primary-dark"
            >
              Create Your First Fee Structure
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Grade Level</th>
                  <th className="px-4 py-3">Fee Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Frequency</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {feeStructures.map((fee) => (
                  <tr key={fee.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-gray-900">
                      {fee.name}
                    </td>
                    <td className="px-4 py-4">
                      {fee.gradeLevel === 'ALL' ? 'All Grades' : fee.gradeLevel.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-4">
                      {fee.feeType.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-4 font-medium">
                      {formatCurrency(fee.amount)}
                    </td>
                    <td className="px-4 py-4">
                      {fee.frequency.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${fee.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {fee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEdit(fee)}
                          variant="outline"
                          size="sm"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(fee.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ShowcaseSection>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <ShowcaseSection
          className="!p-6"
          title='Total Fee Structure'
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">Total Fee Structures</h3>
            <p className="text-2xl font-bold text-primary mt-2">{feeStructures.length}</p>
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          className="!p-6"
          title='Active Structures'
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">Active Structures</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {feeStructures.filter(fee => fee.isActive).length}
            </p>
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          className="!p-6"
          title='Total Revenue'
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {formatCurrency(feeStructures.reduce((sum, fee) => sum + fee.amount, 0))}
            </p>
          </div>
        </ShowcaseSection>
      </div>
    </div>
  );
}