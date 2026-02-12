import type { Staff } from "@/api/db/staff-type";

export const transformStaffData = (data: any[]): Staff[] => {
    if (!Array.isArray(data)) {
        return [];
    }

    return data.map(staff => ({
        // Convert id from number to string
        id: staff.id.toString(),
        staffId: staff.staffId,
        name: staff.name,
        surname: staff.surname,
        email: staff.email,
        phone: staff.phone,
        employmentType: staff.employmentType,
        position: staff.position,
        department: staff.department,
        hireDate: staff.hireDate,
        qualification: staff.qualification,
        experience: staff.experience,
        role: staff.role,
        
        // Optional fields (transform null to undefined)
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

// Keep your other utility functions
export const getStatusBadge = (isActive: boolean | null | undefined, employmentStatus?: string | null) => {
    if (!isActive) {
        return "bg-red-100 text-red-800 border border-red-200";
    }
    switch (employmentStatus) {
        case 'suspended':
            return "bg-yellow-100 text-yellow-800 border border-yellow-200";
        case 'terminated':
            return "bg-red-100 text-red-800 border border-red-200";
        default:
            return "bg-green-100 text-green-800 border border-green-200";
    }
};