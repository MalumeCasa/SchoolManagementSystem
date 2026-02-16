import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import MedicalConsentPage from "@components/Student/MedicalConsent";

export const metadata = {
  title: "Register Student Medical Consent - EduManage",
  description: "School Management System Student Registration",
};

export default async function RegisterStudentMedicalPage() {
  const user = await requireAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <Layout user={user}>
      {user.role === "admin" || user.role === "student" ? <MedicalConsentPage user={user} /> : null}
      
    </Layout>
  );
}