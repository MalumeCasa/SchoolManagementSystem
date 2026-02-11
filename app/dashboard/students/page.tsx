// This is now a Next.js Server Component
import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";

import { getStudents } from "@api/student-action";

import  { DisplayStudentsPage } from "@components/Students/displayStudents";


export const metadata: Metadata = {
    title: "Students Page",
};

// Convert the page component to an `async` function
export default async function StudentDirectoryPage() {
    // Fetch data directly in the Server Component
    const students = await getStudents();

    return (
        <>
            <Breadcrumb pageName="Student Directory" />

            <div className="grid grid-cols-1 gap-9 sm:grid-cols-1">
                <div className="flex flex-col gap-9">
                    <ShowcaseSection title="Student Directory" className="space-y-5.5 !p-6.5">
                        <h2>Students</h2>

                        <Link
                            href="/dashboard/users/students/new/"
                            className="flex w-full justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90"
                        >
                            Register Student
                        </Link>

                        <Link
                            href="/dashboard/users/students/new/student/single"
                            className="flex w-full justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90"
                        >
                            Add Single Student
                        </Link>

                        <Link
                            href="/dashboard/users/students/new/student/bulk"
                            className="flex w-full justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90"
                        >
                            Add Bulk Students
                        </Link>
                        <Link
                            href="/dashboard/users/students/new/student/fast-upload"
                            className="flex w-full justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90"
                        >
                            Fast Students - Database Upload
                        </Link>
                    </ShowcaseSection>
                    
                    <DisplayStudentsPage  students={students}/>
                </div>
            </div>
        </>
    );
}