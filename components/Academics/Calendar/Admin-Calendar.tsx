import React from "react";
import type { Metadata } from "next";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { getAllSubjects } from '@api/subject-actions';
import Calendar from './components/Calendar';

export const metadata: Metadata = {
    title: "School Calendar - School Management System",
    description: "View all class schedules and events",
};

export default async function CalendarPage({ user }: { user: any }) {
    const subjectsResult = await getAllSubjects();
    const subjects = subjectsResult?.success ? subjectsResult.data.map(subject => ({
        ...subject,
        updatedAt: subject.updatedAt || undefined,
        createdAt: subject.createdAt || undefined
    })) : [];

    return (
        <>
            <Breadcrumb pageName="School Calendar" />
            <div className="grid grid-cols-1 gap-9 sm:grid-cols-1">
                <div className="flex flex-col gap-9x">
                    <ShowcaseSection title="School Calendar" className="space-y-5.5 !p-6.5">
                        <Calendar subjects={subjects} />
                    </ShowcaseSection>
                </div>
            </div>
        </>
    );
}