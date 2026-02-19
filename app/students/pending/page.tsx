import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import StudentVerificationPage from "@components/Student/student-verification";

export const metadata = {
  title: "Student Verification - EduManage",
  description: "School Management System Student Verification Page",
};

export default async function StudentsPage() {
  const user = await requireAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <Layout user={user}>
      {user.role === "admin" || user.role === "teacher" ? <StudentVerificationPage user={user} /> : null}
      
    </Layout>
  );
}