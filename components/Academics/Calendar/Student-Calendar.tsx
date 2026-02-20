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

export default async function StudentCalendarPage({ user }: { user: any }) {
    const subjectsResult = await getAllSubjects();
    const allSubjects = subjectsResult?.success ? subjectsResult.data.map(subject => ({
        ...subject,
        updatedAt: subject.updatedAt || undefined,
        createdAt: subject.createdAt || undefined
    })) : [];

    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

    // Students only see subjects that match their assigned className
    const subjects = isAdmin
        ? allSubjects
        : allSubjects.filter(subject => subject.className === user?.className);

    return (
        <>
            <Breadcrumb pageName="School Calendar" />
            <div className="grid grid-cols-1 gap-9 sm:grid-cols-1">
                <div className="flex flex-col gap-9x">
                    <ShowcaseSection title={`School Calendar for ${user?.fullName + ' (' + user?.idNumber + ')' || 'All Classes'}`} className="space-y-5.5 !p-6.5">
                        <Calendar subjects={subjects} />
                    </ShowcaseSection>
                </div>
            </div>
        </>
    );
}