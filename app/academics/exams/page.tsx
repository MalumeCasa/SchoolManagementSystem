import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import AdminExamsPage from "@/components/Academics/Exams/Admin-Exam";

export const metadata = {
  title: "Exams - EduManage",
  description: "School Management System Exams Directory",
};

export default async function StudentsPage() {
  const user = await requireAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <Layout user={user}>
      {user.role === "admin" ? <AdminExamsPage user={user} /> : null}
      
    </Layout>
  );
}