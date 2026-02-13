// app/assignments/list/page.tsx
import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

import Breadcrumb from "@components/Breadcrumbs/Breadcrumb";
import { Button } from "@components/ui-elements/button";
import AssignmentsList from "./components/assignments-list";
import { getAssignments } from "@api/assignments-actions";

export const metadata: Metadata = {
  title: "All Assignments",
  description: "View and manage all assignments",
};

export default async function AdminAssignmentsListPage({ user }: { user: any }) {
  const assignmentsData = await getAssignments();
  const assignments = assignmentsData.success ? assignmentsData.data : [];

  return (
    <>
      <Breadcrumb pageName="All Assignments" />
      
      {/* BUTTONS */}
      <div className="flex justify-between mb-6 gap-3">
        <Link href="/academics/assignments">
          <Button
            label="Back"
            variant="outline"
            shape="rounded"
            size="small"
            icon="←"
          />
        </Link>
        
        <div className="flex gap-3">
          <Link href="/academics/assignments/new">
            <Button
              label="Create New Assignment"
              variant="primary"
              shape="rounded"
              size="small"
              icon="➕"
            />
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-9 sm:grid-cols-1">
        <div className="flex flex-col gap-9">
          <AssignmentsList assignments={assignments} />
        </div>
      </div>
    </>
  );
}