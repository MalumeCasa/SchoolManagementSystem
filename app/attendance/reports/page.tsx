import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { Layout } from "@/components/layout"
import AdminAttendanceReportsPage from "@/components/Attendance/Admin-Attendance-Reports"

export const metadata = {
    title: "Attendance Reports - EduManage",
    description: "School Management System Attendance Reports Page",
}

export default async function AttendanceReportsPage() {
    const user = await requireAuth()

    if (!user) {
        redirect("/login")
    }

    return (
        <Layout user={user}>
            {user.role === "admin" && <AdminAttendanceReportsPage user={user} />}
        </Layout>
    )
}
