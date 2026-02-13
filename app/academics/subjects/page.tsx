import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import SubjectsDirectoryPage from "@components/Academics/Subjects/SubjectsDirectoryPage";

export const metadata = {
  title: "Subjects - EduManage",
  description: "School Management System Subjects Directory",
};

export default async function StudentsPage() {
  const user = await requireAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <Layout user={user}>
      {user.role === "admin" || user.role === "teacher" ? <SubjectsDirectoryPage user={user} /> : null}
      
    </Layout>
  );
}