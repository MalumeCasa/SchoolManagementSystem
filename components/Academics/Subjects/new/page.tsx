import React from "react";
import type { Metadata } from "next";

import NewSubjectForm from '../components/new-subject-form';

export const metadata: Metadata = {
    title: "Add New Subject - School Management System",
    description: "Add a new subject to the curriculum",
};

export default function AddSubjectPage({ user }: { user: any }) {
    return <NewSubjectForm isEdit={false} user={user} />;
}