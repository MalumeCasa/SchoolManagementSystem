import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import AttendancePage from "./AttendancePage"; 


export const metadata = {
  title: "Staff - EduManage",
  description: "School Management System Staff Attendance",

};

export default async function StaffPage() {
  const user = await requireAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <Layout user={user}>
      {user.role === "admin" || user.role === "teacher" ? <AttendancePage /> : null}
      
    </Layout>
  );
}