import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import StudentAgreementFormPage from "@components/Student/agreement-form";

export const metadata = {
  title: "Register Student - Kiddies Town Portal",
  description: "School Management System Student Registration",
};

export default async function RegisterStudentPage() {
  const user = await requireAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <Layout user={user}>
      {user.role === "admin" || user.role === "student" ? <StudentAgreementFormPage user={user} /> : null}
      
    </Layout>
  );
}