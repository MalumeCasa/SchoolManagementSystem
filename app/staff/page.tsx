// This is a Next.js Server Component
import React from "react";
import type { Metadata } from "next";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getAllStaff } from '@/app/api/staff-actions';
import { DisplayStaffPage } from '@components/Staff/displayStaff';
import type { Staff } from '@/app/api/db/types';

export const metadata: Metadata = {
    title: "Staff Directory - School Management System",
    description: "Manage and view all staff members in the school",
};

// Helper to transform null to undefined
const transformStaffData = (data: any[]): Staff[] => {
    return data.map(staff => ({
        ...staff,
        address: staff.address ?? undefined,
        dateOfBirth: staff.dateOfBirth ?? undefined,
        gender: staff.gender ?? undefined,
        emergencyContact: staff.emergencyContact ?? undefined,
        emergencyPhone: staff.emergencyPhone ?? undefined,
        terminationDate: staff.terminationDate ?? undefined,
        employmentStatus: staff.employmentStatus ?? undefined,
        specialization: staff.specialization ?? undefined,
        certifications: staff.certifications ?? undefined,
        subjects: staff.subjects ?? undefined,
        permissions: staff.permissions ?? undefined,
        accessLevel: staff.accessLevel ?? undefined,
        isActive: staff.isActive ?? undefined,
        createdAt: staff.createdAt ?? undefined,
        updatedAt: staff.updatedAt ?? undefined,
    }));
};

export default async function StaffDirectoryPage() {
    // Fetch staff data directly in the Server Component
    const staffResult = await getAllStaff();
    
    // Handle the API response properly and transform data
    const staff = staffResult?.success ? transformStaffData(staffResult.data) : [];

    return (
        <>
            <Breadcrumb pageName="Staff Directory" />
            <DisplayStaffPage staff={staff} />
        </>
    );
}