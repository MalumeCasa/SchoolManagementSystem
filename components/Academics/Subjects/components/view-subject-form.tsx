import React from "react";
import type { Metadata } from "next";

import { getSubjectById } from '@api/subject-actions';
import ViewSubjectForm from '../components/view-subject-form';

// Define the proper type for assessments
interface Assessment {
  type: string;
  date: string;
}

// For Next.js 14+ with App Router
interface ViewSubjectPageProps {
    params: Promise<{
        id: string;
    }>;
}

export async function generateMetadata({ params }: ViewSubjectPageProps): Promise<Metadata> {
    // Await the params since they're now a Promise
    const { id } = await params;
    const subjectId = parseInt(id);
    const result = await getSubjectById(subjectId);
    
    if (!result.success) {
        return {
            title: "Subject Not Found",
        };
    }

    return {
        title: `${result.data.name} - Subject Details`,
        description: `View details for ${result.data.name} taught by ${result.data.teacher}`,
    };
}

export default async function ViewSubjectPage({ params }: ViewSubjectPageProps) {
    // Await the params since they're now a Promise
    const { id } = await params;
    const subjectId = parseInt(id);
    const result = await getSubjectById(subjectId);
    
    if (!result.success) {
        return (
            <div className="p-6 text-center">
                <h1 className="text-2xl font-bold text-red-600">Subject not found</h1>
                <p className="mt-2">The requested subject does not exist.</p>
            </div>
        );
    }

    // Transform the data to handle null values and properly type assessments
    const subjectData = {
        ...result.data,
        updatedAt: result.data.updatedAt || undefined,
        createdAt: result.data.createdAt || undefined,
        assessments: Array.isArray(result.data.assessments) 
            ? (result.data.assessments as Assessment[])
            : []
    };
}