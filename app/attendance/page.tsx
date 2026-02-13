import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { Layout } from "@/components/layout"
import AdminAttendancePage from "@/components/Attendance/Admin-Attendance"


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
        <Layout user={user}>
            {user.role === "admin" && <AdminAttendancePage user={user} />}
        </Layout>
    )
}
