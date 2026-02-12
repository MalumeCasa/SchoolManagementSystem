import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import StudentDirectoryPage from "@components/Management/Students/StudentDirectory";

export const metadata = {
  title: "Students - EduManage",
  description: "School Management System Student Directory",
};

export default async function StudentsPage() {
  const user = await requireAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <Layout user={user}>
      {user.role === "admin" || user.role === "teacher" ? <StudentDirectoryPage user={user} /> : null}
      
    </Layout>
  );
}