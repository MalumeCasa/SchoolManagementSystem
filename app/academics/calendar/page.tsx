import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import CalendarPage from "@/components/Academics/Calendar/Admin-Calendar";

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
      {user.role === "admin" || user.role === "teacher" || user.role === "student" ? <CalendarPage user={user} /> : null}
      {/* Add other role dashboards here if needed */}
      
    </Layout>
  );
}