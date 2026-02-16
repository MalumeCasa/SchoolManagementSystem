import React from "react";
import Link from "next/link";

import { FinancialAgreementPage } from "@components/Student/financial-agreement-form";

import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Button } from "@/components/ui-elements/button";

export const metadata: Metadata = {
    title: "Students Page",
};

export default function StudentAgreementFormPage({ user }: { user: { id: number; fullName: string; role: string } }) {
    return (
        <>
            <Breadcrumb pageName="Student Agreement Forms" />

            {/* BUTTONS */}
            <div className="flex justify-end mb-6 gap-3">
                <Link href="/dashboard/users/students/new/consent/">
                    <Button
                        label="Back"
                        variant="outline"
                        shape="rounded"
                        size="small"
                        icon="←" // or use an actual icon component
                    />
                </Link>
                <Link href="/dashboard/users/students/">
                    <Button
                        label="Cancel"
                        variant="dark"
                        shape="rounded"
                        size="small"
                        icon="×" // or use an actual icon component
                    />
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-9 sm:grid-cols-1">
                <div className="flex flex-col gap-9">
                    <FinancialAgreementPage />
                </div>
            </div>
        </>
    )
}