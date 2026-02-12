import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import StaffDirectoryPage from "./staff/StaffDirectoryPage"; // adjust path

export const metadata = {
  title: "Staff - EduManage",
  description: "School Management System Staff Directory",
};

export default async function StaffPage() {
  const user = await requireAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <Layout user={user}>
      {user.role === "admin" || user.role === "teacher" ? <StaffDirectoryPage /> : null}
      {/* Add other role dashboards here if needed */}
      
    </Layout>
  );
}