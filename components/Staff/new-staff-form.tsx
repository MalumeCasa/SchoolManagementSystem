"use client";

import React, { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import InputGroup from "@/components/FormElements/InputGroup";
import { updateStaff, createStaff } from "@api/staff-actions";
import type { Staff, StaffRole, EmploymentType, Department } from "@api/db/staff-type";

// ---------- Types ----------

interface ActionState {
    success: boolean | null;
    message: string;
}

interface NewStaffFormProps {
    staff?: Staff;
    isEdit?: boolean;
    user?: any;
}

// ---------- Toast ----------

function Toast({ state, onDismiss }: { state: ActionState; onDismiss: () => void }) {
    useEffect(() => {
        if (state.success === null) return;
        const timer = setTimeout(onDismiss, 4000);
        return () => clearTimeout(timer);
    }, [state, onDismiss]);

    if (state.success === null) return null;

    const base =
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg px-5 py-4 text-white shadow-lg transition-all";
    const color = state.success ? "bg-green-600" : "bg-red-600";
    const icon = state.success ? "✓" : "✕";

    return (
        <div className={`${base} ${color}`} role="alert">
            <span className="text-lg font-bold">{icon}</span>
            <span>{state.message}</span>
            <button onClick={onDismiss} className="ml-2 opacity-75 hover:opacity-100 text-xl leading-none">
                &times;
            </button>
        </div>
    );
}

// ---------- Form ----------

const initialState: ActionState = { success: null, message: "" };

export default function NewStaffForm({ staff, isEdit = false, user }: NewStaffFormProps) {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);

    const defaultStaff: Partial<Staff> = {
        id: 0,
        staffId: "",
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
        hireDate: new Date().toISOString().split("T")[0],
        role: "teacher" as StaffRole,
        qualification: "",
        specialization: "",
        experience: 0,
        certifications: [],
        subjects: [],
        isActive: true,
    };

    const currentStaff = staff || defaultStaff;
    const formTitle = isEdit
        ? `Edit ${currentStaff.name} ${currentStaff.surname}`
        : "Add New Staff";
    const submitButtonText = isEdit ? "Update Staff" : "Create Staff";

    // Wrap server actions to return ActionState
    async function handleSubmit(_prev: ActionState, formData: FormData): Promise<ActionState> {
        try {
            let result;
            if (isEdit && currentStaff.id) {
                result = await updateStaff(Number(currentStaff.id), formData);
            } else {
                result = await createStaff(formData);
            }

            if (result?.error) {
                return { success: false, message: result.error };
            }

            return {
                success: true,
                message: isEdit
                    ? "Staff member updated successfully."
                    : "Staff member created successfully.",
            };
        } catch (err: any) {
            return {
                success: false,
                message: err?.message ?? "An unexpected error occurred. Please try again.",
            };
        }
    }

    const [state, formAction, isPending] = useActionState(handleSubmit, initialState);

    // Redirect on success
    useEffect(() => {
        if (state.success === true) {
            // Small delay so the user sees the toast before navigating
            const timer = setTimeout(() => router.push("/staff"), 1500);
            return () => clearTimeout(timer);
        }
    }, [state, router]);

    function dismissToast() {
        // Reset by mutating — simplest way without extra state
        (state as ActionState).success = null;
    }

    return (
        <>
            <Breadcrumb pageName={isEdit ? "Edit Staff" : "New Staff"} />

            <Toast state={state} onDismiss={() => ((state as any).success = null)} />

            {/* Inline error banner (visible above the form) */}
            {state.success === false && (
                <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-5 py-3 text-red-700 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400">
                    <strong>Error:</strong> {state.message}
                </div>
            )}

            <div className="grid grid-cols-1 gap-9 sm:grid-cols-1">
                <div className="flex flex-col gap-9">
                    <ShowcaseSection title={formTitle} className="space-y-5.5 !p-6.5">
                        <form ref={formRef} className="space-y-6" action={formAction}>
                            {/* Staff ID */}
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

                            {/* Personal Information */}
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
                                        defaultValue={currentStaff.dateOfBirth || ""}
                                        className="w-full xl:w-1/2"
                                    />
                                </div>

                                <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
                                    <InputGroup
                                        label="EMERGENCY CONTACT"
                                        name="emergencyContact"
                                        type="text"
                                        placeholder="Emergency contact name"
                                        defaultValue={currentStaff.emergencyContact || ""}
                                        className="w-full xl:w-1/2"
                                    />
                                    <InputGroup
                                        label="EMERGENCY PHONE"
                                        name="emergencyPhone"
                                        type="text"
                                        placeholder="Emergency contact phone"
                                        defaultValue={currentStaff.emergencyPhone || ""}
                                        className="w-full xl:w-1/2"
                                    />
                                </div>

                                <div className="mb-4.5 xl:w-1/2">
                                    <label className="mb-2.5 block text-black dark:text-white">GENDER</label>
                                    <select
                                        name="gender"
                                        defaultValue={currentStaff.gender || ""}
                                        className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    >
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                        <option value="prefer_not_to_say">Prefer not to say</option>
                                    </select>
                                </div>
                            </div>

                            {/* Employment Information */}
                            <div className="border-b border-gray-200 pb-6">
                                <h3 className="text-lg font-semibold mb-4">Employment Information</h3>

                                <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
                                    <InputGroup
                                        label="POSITION"
                                        name="position"
                                        type="text"
                                        placeholder="e.g., Class Teacher, HOD"
                                        defaultValue={currentStaff.position || ""}
                                        className="w-full xl:w-1/2"
                                        required
                                    />
                                    <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">DEPARTMENT</label>
                                        <select
                                            name="department"
                                            defaultValue={currentStaff.department}
                                            className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            required
                                        >
                                            <option value="academic">Academic</option>
                                            <option value="administration">Administration</option>
                                            <option value="support">Support</option>
                                            <option value="finance">Finance</option>
                                            <option value="library">Library</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
                                    <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">EMPLOYMENT TYPE</label>
                                        <select
                                            name="employmentType"
                                            defaultValue={currentStaff.employmentType}
                                            className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            required
                                        >
                                            <option value="full-time">Full-time</option>
                                            <option value="part-time">Part-time</option>
                                            <option value="contract">Contract</option>
                                            <option value="temporary">Temporary</option>
                                        </select>
                                    </div>
                                    <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">ROLE</label>
                                        <select
                                            name="role"
                                            defaultValue={currentStaff.role}
                                            className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                                        defaultValue={currentStaff.hireDate}
                                        className="w-full xl:w-1/2"
                                        required
                                    />
                                </div>

                                {isEdit && (
                                    <div className="mb-4.5">
                                        <label className="mb-2.5 block text-black dark:text-white">EMPLOYMENT STATUS</label>
                                        <select
                                            name="employmentStatus"
                                            defaultValue={currentStaff.employmentStatus || "active"}
                                            className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary xl:w-1/2"
                                        >
                                            <option value="active">Active</option>
                                            <option value="suspended">Suspended</option>
                                            <option value="terminated">Terminated</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Professional Information */}
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
                                            placeholder="e.g., Teaching Certificate, First Aid"
                                            defaultValue={currentStaff.certifications?.join(", ") || ""}
                                            className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">Separate multiple certifications with commas</p>
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
                                        defaultValue={currentStaff.subjects?.join(", ") || ""}
                                        className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                                    disabled={isPending}
                                    className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isPending ? (
                                        <>
                                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            {isEdit ? "Updating..." : "Creating..."}
                                        </>
                                    ) : (
                                        submitButtonText
                                    )}
                                </button>
                            </div>
                        </form>
                    </ShowcaseSection>
                </div>
            </div>
        </>
    );
}