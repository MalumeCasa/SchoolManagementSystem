import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import AdminCalendarPage from "@/components/Academics/Calendar/Admin-Calendar";
import StudentCalendarPage from "@/components/Academics/Calendar/Student-Calendar";

export const metadata = {
  title: "TimeTable - EduManage",
  description: "School Management System TimeTable",
};

export default async function StudentsPage() {
  const user = await requireAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <Layout user={user}>
      {user.role === "admin" || user.role === "teacher" ? <AdminCalendarPage user={user} /> : null}
      {user.role === "student" ? <StudentCalendarPage user={user} /> : null}
      
    </Layout>
  );
}