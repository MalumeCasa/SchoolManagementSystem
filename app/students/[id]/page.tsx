import { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import LoadingSpinner from '@/components/Staff/common/LoadingSpinner';
import EditStudentPage from '@components/Management/Students/view-student';

export const metadata: Metadata = {
  title: 'Student Profile - Kiddies Town Portal',
  description: 'View student details and information',
};

export default async function ViewIDStudentPage({ params }: { params: Promise<{ id: string }> }) {

  const user = await requireAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <Layout user={user}>
      <Suspense fallback={<LoadingSpinner />}>
      {user.role === "admin"? <EditStudentPage params={params} /> : null}
      </Suspense>
    </Layout>

  );
}