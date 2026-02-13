import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { Layout } from "@/components/layout"
import AdminAttendanceRecordsPage from "@/components/Attendance/Admin-Attendance-Records"

export const metadata = {
    title: "Attendance Records - EduManage",
    description: "School Management System Attendance Records Page",
}

export default async function AttendanceRecordsPage() {
    const user = await requireAuth()

    if (!user) {
        redirect("/login")
    }

    return (
        <Layout user={user}>
            {user.role === "admin" && <AdminAttendanceRecordsPage user={user} />}
        </Layout>
    )
}
