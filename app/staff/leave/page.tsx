import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import LeaveManagementPage from "@components/Management/Staff/StaffLeaveManage";


export const metadata = {
  title: "Staff Leave - EduManage",
  description: "School Management System Staff Leave Management",
};

export default async function StaffLeavePage() {
  const user = await requireAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <Layout user={user}>
      {user.role === "admin" || user.role === "teacher" ? <LeaveManagementPage user={user} /> : null}
      
    </Layout>
  );
}