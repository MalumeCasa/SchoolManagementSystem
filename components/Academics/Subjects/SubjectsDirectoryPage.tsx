import React from "react";
import type { Metadata } from "next";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getAllSubjects } from '@api/subject-actions';
import { DisplaySubjectsPage } from './components/displaySubjects';
import type { Subject } from "@api/types";

// Define the proper type for assessments
interface Assessment {
  type: string;
  date: string;
}

// Transform the API data to match the Subject type
function transformSubjectsData(apiData: any[]): Subject[] {
  return apiData.map(item => ({
    ...item,
    assessments: Array.isArray(item.assessments) 
      ? item.assessments.map((assessment: any) => ({
          type: assessment?.type || 'Unknown',
          date: assessment?.date || new Date().toISOString().split('T')[0]
        }))
      : []
  }));
}

export const metadata: Metadata = {
    title: "Subjects Directory - School Management System",
    description: "Manage and view all subjects in the school",
};

export default async function AdminSubjectsDirectoryPage({ user }: { user: any }) {
    const subjectsResult = await getAllSubjects();
    
    // Transform the data to match the Subject type
    const subjects = subjectsResult?.success 
        ? transformSubjectsData(subjectsResult.data)
        : [];

    return (
        <>
            <Breadcrumb pageName="Subjects Directory" />
            <DisplaySubjectsPage subjects={subjects} />
        </>
    );
}