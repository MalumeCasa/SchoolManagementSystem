import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";

import { getStudents } from "@api/student-action";
import { DisplayStudentsPage } from "@components/Students/displayStudents";

export const metadata: Metadata = {
  title: "Students Page",
};

export default async function StudentDirectoryPage() {
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
          </ShowcaseSection>

          <DisplayStudentsPage students={students} />
        </div>
      </div>
    </>
  );
}