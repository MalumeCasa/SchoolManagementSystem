import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import AddSubjectPage from "@components/Academics/Subjects/new/page"; // adjust path

export const metadata = {
  title: "New Subject - EduManage",
  description: "Create a new subject in the School Management System",
};

export default async function NewSubjectPage() {
  const user = await requireAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <Layout user={user}>
      {user.role === "admin" || user.role === "teacher" ? <AddSubjectPage user={user} /> : null}
      
    </Layout>
  );
}