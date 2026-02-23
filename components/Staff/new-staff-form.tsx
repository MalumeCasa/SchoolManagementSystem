import React from "react";
import Link from "next/link";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";

import InputGroup from "@/components/FormElements/InputGroup";
import { updateStaff, createStaff } from "@api/staff-actions";
import type { Staff, StaffRole, EmploymentType, Department } from "@api/db/staff-type";

// Props for the form - can be used for both new and edit
interface NewStaffFormProps {
    staff?: Staff; // Optional for new staff creation
    isEdit?: boolean; // Flag to indicate if it's edit mode
}

export default function NewStaffForm({ staff, isEdit = false, user }: NewStaffFormProps & { user: any }) {
    // Default empty staff for new staff creation
    const defaultStaff: Partial<Staff> = {
        id: 0,
        staffId: "", // Will be generated automatically
        name: "",
        surname: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        gender: "",
        emergencyContact: "",
        emergencyPhone: "",
        employmentType: "full-time" as EmploymentType,
        position: "",
        department: "academic" as Department,
        hireDate: new Date().toISOString().split('T')[0],
        role: "teacher" as StaffRole,
        qualification: "",
        specialization: "",
        experience: 0,
        certifications: [],
        subjects: [],
        isActive: true,
    };

    const currentStaff = staff || defaultStaff;
    const formTitle = isEdit ? `Edit ${currentStaff.name} ${currentStaff.surname}` : "Add New Staff";
    const submitButtonText = isEdit ? "Update Staff" : "Create Staff";

    // Handle form submission
    // Handle form submission
    const submitAction = isEdit && currentStaff.id
        ? updateStaff.bind(null, Number(currentStaff.id)) // Convert to number
        : createStaff;

    return (
        <>
            <Breadcrumb pageName={isEdit ? "Edit Staff" : "New Staff"} />
            <div className="grid grid-cols-1 gap-9 sm:grid-cols-1">
                <div className="flex flex-col gap-9">
                    <ShowcaseSection title={formTitle} className="space-y-5.5 !p-6.5">
                        <form className="space-y-6" action={submitAction}>
                            {/* Staff ID Display (for existing staff) or hidden field for new */}
                            {isEdit ? (
                                <div className="mb-4.5">
                                    <InputGroup
                                        label="STAFF ID"
                                        name="staffId"
                                        type="text"
                                        placeholder="Staff ID"
                                        defaultValue={currentStaff.staffId}
                                        className="w-full xl:w-1/2"
                                        required
                                        readOnly
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Staff ID is automatically generated and cannot be changed
                                    </p>
                                </div>
                            ) : (
                                <input type="hidden" name="autoGenerateStaffId" value="true" />
                            )}

                            {/* Personal Information Section */}
                            <div className="border-b border-gray-200 pb-6">
                                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>

                                <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
                                    <InputGroup
                                        label="SURNAME"
                                        name="surname"
                                        type="text"
                                        placeholder="Enter surname"
                                        defaultValue={currentStaff.surname}
                                        className="w-full xl:w-1/2"
                                        required
                                    />
                                    <InputGroup
                                        label="FIRST NAME"
                                        name="name"
                                        type="text"
                                        placeholder="Enter first name"
                                        defaultValue={currentStaff.name}
                                        className="w-full xl:w-1/2"
                                        required
                                    />
                                </div>

                                <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
                                    <InputGroup
                                        label="Email"
                                        name="email"
                                        type="email"
                                        placeholder="Enter email address"
                                        defaultValue={currentStaff.email}
                                        className="w-full xl:w-1/2"
                                        required
                                    />
                                    <InputGroup
                                        label="PHONE NUMBER"
                                        name="phone"
                                        type="text"
                                        placeholder="Enter phone number"
                                        defaultValue={currentStaff.phone}
                                        className="w-full xl:w-1/2"
                                        required
                                    />
                                </div>

                                <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
                                    <InputGroup
                                        label="ADDRESS"
                                        name="address"
                                        type="text"
                                        placeholder="Enter full address"
                                        defaultValue={currentStaff.address || ""}
                                        className="w-full xl:w-1/2"
                                    />
                                    <InputGroup
                                        label="DATE OF BIRTH"
                                        name="dateOfBirth"
                                        type="date"
                                        placeholder="Select date of birth"
                                        defaultValue={currentStaff.dateOfBirth || ""}
                                        className="w-full xl:w-1/2"
                                    />
                                </div>

                                <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
                                    <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            GENDER
                                        </label>
                                        <select
                                            name="gender"
                                            defaultValue={currentStaff.gender || ""}
                                            className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <InputGroup
                                        label="EMERGENCY CONTACT NAME"
                                        name="emergencyContact"
                                        type="text"
                                        placeholder="Emergency contact person"
                                        defaultValue={currentStaff.emergencyContact || ""}
                                        className="w-full xl:w-1/2"
                                    />
                                </div>

                                <div className="mb-4.5">
                                    <InputGroup
                                        label="EMERGENCY CONTACT PHONE"
                                        name="emergencyPhone"
                                        type="text"
                                        placeholder="Emergency contact phone number"
                                        defaultValue={currentStaff.emergencyPhone || ""}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Employment Information Section */}
                            <div className="border-b border-gray-200 pb-6">
                                <h3 className="text-lg font-semibold mb-4">Employment Information</h3>

                                <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
                                    <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            EMPLOYMENT TYPE
                                        </label>
                                        <select
                                            name="employmentType"
                                            defaultValue={currentStaff.employmentType}
                                            className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            required
                                        >
                                            <option value="full-time">Full Time</option>
                                            <option value="part-time">Part Time</option>
                                            <option value="contract">Contract</option>
                                        </select>
                                    </div>
                                    <InputGroup
                                        label="POSITION/TITLE"
                                        name="position"
                                        type="text"
                                        placeholder="e.g., Mathematics Teacher, Principal"
                                        defaultValue={currentStaff.position}
                                        className="w-full xl:w-1/2"
                                        required
                                    />
                                </div>

                                <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
                                    <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            DEPARTMENT
                                        </label>
                                        <select
                                            name="department"
                                            defaultValue={currentStaff.department}
                                            className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            required
                                        >
                                            <option value="academic">Academic</option>
                                            <option value="administrative">Administrative</option>
                                            <option value="support">Support</option>
                                        </select>
                                    </div>
                                    <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            ROLE
                                        </label>
                                        <select
                                            name="role"
                                            defaultValue={currentStaff.role}
                                            className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            required
                                        >
                                            <option value="teacher">Teacher</option>
                                            <option value="principal">Principal</option>
                                            <option value="vice_principal">Vice Principal</option>
                                            <option value="head_of_department">Head of Department</option>
                                            <option value="administrator">Administrator</option>
                                            <option value="support_staff">Support Staff</option>
                                            <option value="accountant">Accountant</option>
                                            <option value="librarian">Librarian</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-4.5">
                                    <InputGroup
                                        label="HIRE DATE"
                                        name="hireDate"
                                        type="date"
                                        placeholder="Select hire date"
                                        defaultValue={currentStaff.hireDate}
                                        className="w-full xl:w-1/2"
                                        required
                                    />
                                </div>

                                {isEdit && (
                                    <div className="mb-4.5">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            EMPLOYMENT STATUS
                                        </label>
                                        <select
                                            name="employmentStatus"
                                            defaultValue={currentStaff.employmentStatus || "active"}
                                            className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        >
                                            <option value="active">Active</option>
                                            <option value="suspended">Suspended</option>
                                            <option value="terminated">Terminated</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Professional Information Section */}
                            <div className="border-b border-gray-200 pb-6">
                                <h3 className="text-lg font-semibold mb-4">Professional Information</h3>

                                <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
                                    <InputGroup
                                        label="QUALIFICATION"
                                        name="qualification"
                                        type="text"
                                        placeholder="e.g., B.Ed, M.A., PhD"
                                        defaultValue={currentStaff.qualification}
                                        className="w-full xl:w-1/2"
                                        required
                                    />
                                    <InputGroup
                                        label="SPECIALIZATION"
                                        name="specialization"
                                        type="text"
                                        placeholder="e.g., Mathematics, Science"
                                        defaultValue={currentStaff.specialization || ""}
                                        className="w-full xl:w-1/2"
                                    />
                                </div>

                                <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
                                    <InputGroup
                                        label="EXPERIENCE (Years)"
                                        name="experience"
                                        type="number"
                                        placeholder="Enter years of experience"
                                        defaultValue={currentStaff.experience?.toString() || "0"}
                                        className="w-full xl:w-1/2"
                                        required
                                    />
                                    <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            CERTIFICATIONS (Comma separated)
                                        </label>
                                        <input
                                            type="text"
                                            name="certifications"
                                            placeholder="e.g., Teaching Certificate, First Aid, etc."
                                            defaultValue={currentStaff.certifications?.join(', ') || ""}
                                            className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Separate multiple certifications with commas
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-4.5">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        SUBJECTS (Comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        name="subjects"
                                        placeholder="e.g., Mathematics, Physics, Chemistry"
                                        defaultValue={currentStaff.subjects?.join(', ') || ""}
                                        className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Separate multiple subjects with commas (for academic staff)
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-4 pt-6">
                                <Link
                                    href="/staff"
                                    className="rounded-lg bg-gray-500 px-6 py-3 font-medium text-white hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    className="rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90 transition-colors"
                                >
                                    {submitButtonText}
                                </button>
                            </div>
                        </form>
                    </ShowcaseSection>
                </div>
            </div>
        </>
    );
}