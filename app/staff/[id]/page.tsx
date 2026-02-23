import { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import ViewStaffPage from '@components/Staff/view-staff';
import LoadingSpinner from '@/components/Staff/common/LoadingSpinner';

export const metadata: Metadata = {
  title: 'Staff Profile - School Management System',
  description: 'View staff member details and information',
};

export default async function ViewIDStaffPage({ params }: { params: Promise<{ id: string }> }) {

  const user = await requireAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <Layout user={user}>
      <Suspense fallback={<LoadingSpinner />}>
      {user.role === "admin"? <ViewStaffPage params={params} /> : null}
      </Suspense>
    </Layout>

  );
}