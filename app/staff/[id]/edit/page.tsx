import { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import EditStaffPage from '@components/Staff/edit-staff';
import LoadingSpinner from '@/components/Staff/common/LoadingSpinner';

export const metadata: Metadata = {
  title: 'Staff Profile - School Management System',
  description: 'View staff member details and information',
};

export default async function EditIDStaffPage({ params }: { params: Promise<{ id: string }> }) {

  const user = await requireAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <Layout user={user}>
      <Suspense fallback={<LoadingSpinner />}>
      {user.role === "admin"? <EditStaffPage params={params} user={user} /> : null}
      </Suspense>
    </Layout>

  );
}