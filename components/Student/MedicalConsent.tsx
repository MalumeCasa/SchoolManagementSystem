"use client"

import React from "react";
import Link from "next/link";

import MedicalForm from "@components/Student/medical-form";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Button } from "@/components/ui-elements/button";

export default function MedicalConsentPage({ user }: { user: { id: number; fullName: string; role: string } }) {
    return (
        <>
            <Breadcrumb pageName="Medical Consent Form" />

            {/* BUTTONS */}
            <div className="flex justify-end mb-6 gap-3">
                <Link href="/register/new/student/">
                    <Button
                        label="Back"
                        variant="outline"
                        shape="rounded"
                        size="small"
                        icon="←" // or use an actual icon component
                    />
                </Link>

                <Link href="/register/new/student/agreement/">
                    <Button
                        label="Next"
                        variant="green"
                        shape="rounded"
                        size="small"
                        icon="" // or use an actual icon component
                    />
                </Link>

                <Link href="/dashboard/users/students/new/agreement/">
                    <Button
                        label="Cancel"
                        variant="dark"
                        shape="rounded"
                        size="small"
                        icon="x" // or use an actual icon component
                    />
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-9 sm:grid-cols-1">
                <div className="flex flex-col gap-9">
                    <MedicalForm />
                </div>
            </div>
        </>
    )
}
