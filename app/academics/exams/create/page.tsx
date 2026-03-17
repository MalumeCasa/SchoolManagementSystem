import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import CreateExamPage from "@/components/Academics/Exams/Create-Exam";

export const metadata = {
  title: "Create Exam - EduManage",
  description: "Create a new exam in the school management system",
};

export default async function CreateExam() {
  const user = await requireAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <Layout user={user}>
      {user.role === "admin" ? <CreateExamPage user={user} /> : null}
      
    </Layout>
  );
}