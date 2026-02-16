import React from "react";
import Link from "next/link";

import { RegisterStudentForm } from "@components/Student/register-student-form";

import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Button } from "@/components/ui-elements/button";


export const metadata: Metadata = {
    title: "Register Student Page",
};

    export default function RegisterNewStudentPage({ user }: { user: { id: number; fullName: string; role: string } }) {
        return (
            <>
                <Breadcrumb pageName="New Student" />
                
            {/* BUTTONS */}
            <div className="flex justify-end mb-6 gap-3">
                <Link href="/dashboard/users/students/">
                    <Button
                        label="Back"
                        variant="outline"
                        shape="rounded"
                        size="small"
                        icon="←" // or use an actual icon component
                    />
                </Link>
                <Link href="/register/new/student/medical/">
                    <Button
                        label="Next"
                        variant="dark"
                        shape="rounded"
                        size="small"
                        icon="" // or use an actual icon component
                    />
                </Link>
            </div>
            
            <div className="grid grid-cols-1 gap-9 sm:grid-cols-1">
                <div className="flex flex-col gap-9">
                    <RegisterStudentForm />
                </div>
            </div>
        </>
    )
}