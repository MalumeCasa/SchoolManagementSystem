import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"
import { TeacherDashboard } from "@/components/dashboards/teacher-dashboard"
import { StudentDashboard } from "@/components/dashboards/student-dashboard"

export const metadata = {
  title: "Dashboard - EduManage",
  description: "School Management System Dashboard",
}

export default async function DashboardPage() {
  const user = await requireAuth()

  if (!user) {
    redirect("/login")
  }

  return (
    <DashboardLayout user={user}>
      {user.role === "admin" && <AdminDashboard user={user} />}
      {user.role === "teacher" && <TeacherDashboard user={user} />}
      {user.role === "student" && <StudentDashboard user={user} />}
    </DashboardLayout>
  )
}
