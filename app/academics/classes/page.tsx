import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import ClassPage from "../../../components/Academics/Classes/ClassesPage"; // adjust path

export const metadata = {
  title: "Classes - Kiddies Town ECD",
  description: "School Management System Class Directory",
};

export default async function ClassesPage() {
  const user = await requireAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <Layout user={user}>
      {user.role === "admin" || user.role === "teacher" ? <ClassPage /> : null}
      {/* Add other role dashboards here if needed */}
      
    </Layout>
  );
}