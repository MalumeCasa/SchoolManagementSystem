import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import StaffAttendancePage from "@components/Management/Staff/StaffAttendance";

export const metadata = {
  title: "Staff Attendance - EduManage",
  description: "School Management System Staff Attendance",
};

export default async function StaffAttendancePageWrapper() {
  const user = await requireAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <Layout user={user}>
      {user.role === "admin" || user.role === "teacher" ? <StaffAttendancePage user={user} /> : null}
      
    </Layout>
  );
}