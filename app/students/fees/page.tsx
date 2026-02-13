import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import FeesManagementPage from "@/components/Management/Fees/FeesManagementPage";

export const metadata = {
  title: "Fees Management - EduManage",
  description: "School Management System Student Fees Management",
};

export default async function StudentsPage() {
  const user = await requireAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <Layout user={user}>
      {user.role === "admin" || user.role === "teacher" ? <FeesManagementPage user={user} /> : null}
      
    </Layout>
  );
}