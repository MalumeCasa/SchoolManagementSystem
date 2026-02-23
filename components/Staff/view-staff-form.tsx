'use client';

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import type { Staff } from "@api/db/staff-type";

interface ViewStaffFormProps {
    staff: Staff;
}

// Move these utility functions to a separate file for reusability
const formatRole = (role: string) => {
    return role.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
};

const formatEmploymentType = (type: string) => {
    if (!type) return '';
    return type.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
};

const getDepartmentBadge = (department: string) => {
    switch (department) {
        case 'academic':
            return "bg-blue-100 text-blue-800 border border-blue-200";
        case 'administrative':
            return "bg-purple-100 text-purple-800 border border-purple-200";
        case 'support':
            return "bg-orange-100 text-orange-800 border border-orange-200";
        default:
            return "bg-gray-100 text-gray-800 border border-gray-200";
    }
};

const getStatusBadge = (isActive: boolean | null, employmentStatus?: string | null) => {
    if (!isActive) return "bg-red-100 text-red-800 border border-red-200";
    
    switch (employmentStatus) {
        case 'suspended':
            return "bg-yellow-100 text-yellow-800 border border-yellow-200";
        case 'on_leave':
            return "bg-orange-100 text-orange-800 border border-orange-200";
        default:
            return "bg-green-100 text-green-800 border border-green-200";
    }
};

const InfoField = ({ label, value }: { label: string; value?: string | null }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <div className="text-base text-gray-900 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 min-h-[42px] flex items-center">
            {value || <span className="text-gray-400">Not provided</span>}
        </div>
    </div>
);

export default function ViewStaffForm({ staff }: ViewStaffFormProps) {
    const router = useRouter();

    // Handle case where staff is undefined
    if (!staff) {
        return (
            <div className="text-center py-10">
                <p className="text-red-500">Staff member not found</p>
                <button 
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <>
            <Breadcrumb 
                pageName="Staff Profile"
            />
            
            <div className="grid grid-cols-1 gap-9 sm:grid-cols-1">
                <div className="flex flex-col gap-9">
                    <ShowcaseSection 
                        title={`Staff Profile - ${staff.name} ${staff.surname}`} 
                        className="space-y-5.5 !p-6.5"
                    >
                        {/* Header with Actions */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                    {staff.name} {staff.surname}
                                </h1>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDepartmentBadge(staff.department)}`}>
                                        {staff.department?.charAt(0).toUpperCase() + staff.department?.slice(1)}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(staff.isActive, staff.employmentStatus)}`}>
                                        {staff.isActive ? 
                                            (staff.employmentStatus === 'suspended' ? 'Suspended' : 
                                             staff.employmentStatus === 'on_leave' ? 'On Leave' : 'Active') 
                                            : 'Inactive'}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        Joined: {staff.hireDate ? new Date(staff.hireDate).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Link
                                    href={`/dashboard/users/staff/${staff.id}/edit`}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
                                >
                                    Edit Profile
                                </Link>
                                <Link
                                    href="/dashboard/users/staff"
                                    className="flex-1 sm:flex-none px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-center"
                                >
                                    Back
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Personal Information */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Personal Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoField label="Staff ID" value={staff.staffId} />
                                        <InfoField label="Email" value={staff.email} />
                                        <InfoField label="Phone" value={staff.phone} />
                                        <InfoField label="Date of Birth" value={staff.dateOfBirth} />
                                        <InfoField label="Gender" value={staff.gender} />
                                        <InfoField label="Address" value={staff.address} />
                                        <InfoField label="Emergency Contact" value={staff.emergencyContact} />
                                        <InfoField label="Emergency Phone" value={staff.emergencyPhone} />
                                    </div>
                                </div>

                                {/* Employment Information */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Employment Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoField label="Position" value={staff.position} />
                                        <InfoField label="Role" value={formatRole(staff.role)} />
                                        <InfoField label="Department" value={staff.department?.charAt(0).toUpperCase() + staff.department?.slice(1)} />
                                        <InfoField label="Employment Type" value={formatEmploymentType(staff.employmentType)} />
                                        <InfoField label="Hire Date" value={staff.hireDate} />
                                        <InfoField label="Experience" value={staff.experience ? `${staff.experience} years` : 'N/A'} />
                                    </div>
                                </div>
                            </div>

                            {/* Professional Information & Quick Stats */}
                            <div className="space-y-6">
                                {/* Professional Information */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Professional Information</h3>
                                    <div className="space-y-4">
                                        <InfoField label="Qualification" value={staff.qualification} />
                                        <InfoField label="Specialization" value={staff.specialization} />
                                        
                                        {staff.certifications && staff.certifications.length > 0 && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Certifications
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {staff.certifications.map((cert, index) => (
                                                        <span 
                                                            key={index} 
                                                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm border border-blue-200"
                                                        >
                                                            {cert}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {staff.subjects && staff.subjects.length > 0 && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Subjects
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {staff.subjects.map((subject, index) => (
                                                        <span 
                                                            key={index} 
                                                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm border border-green-200"
                                                        >
                                                            {subject}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Quick Info</h3>
                                    <div className="space-y-2">
                                        <QuickStat label="Staff ID" value={staff.staffId} />
                                        <QuickStat label="Employment" value={formatEmploymentType(staff.employmentType)} />
                                        <QuickStat label="Status" value={staff.isActive ? 'Active' : 'Inactive'} />
                                        <QuickStat label="Experience" value={`${staff.experience || 0} years`} />
                                        <QuickStat 
                                            label="Last Updated" 
                                            value={staff.updatedAt ? new Date(staff.updatedAt).toLocaleDateString() : 'N/A'} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">Additional Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <StatCard 
                                    value={staff.experience || 0} 
                                    label="Years of Experience" 
                                    color="blue" 
                                />
                                <StatCard 
                                    value={staff.subjects?.length || 0} 
                                    label="Subjects" 
                                    color="green" 
                                />
                                <StatCard 
                                    value={staff.certifications?.length || 0} 
                                    label="Certifications" 
                                    color="purple" 
                                />
                            </div>
                        </div>
                    </ShowcaseSection>
                </div>
            </div>
        </>
    );
}

const QuickStat = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">{label}:</span>
        <span className="text-sm font-medium">{value}</span>
    </div>
);

const StatCard = ({ value, label, color }: { value: number; label: string; color: string }) => {
    const colorClasses = {
        blue: "text-blue-600",
        green: "text-green-600",
        purple: "text-purple-600",
    };

    return (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`text-2xl font-bold ${colorClasses[color as keyof typeof colorClasses]}`}>
                {value}
            </div>
            <div className="text-sm text-gray-600">{label}</div>
        </div>
    );
};