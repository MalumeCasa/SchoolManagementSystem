import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import StaffPerformancePage from "@components/Management/Staff/StaffPerformance";


export const metadata = {
  title: "Staff Performance - EduManage",
  description: "School Management System Staff Performance Management",
};

export default async function StaffPerformancePageWrapper() {
  const user = await requireAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <Layout user={user}>
      {user.role === "admin" || user.role === "teacher" ? <StaffPerformancePage user={user} /> : null}
      
    </Layout>
  );
}