import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { Layout } from "@/components/layout"
import AdminMarkAttendancePage from "@/components/Attendance/Admin-Mark-Attendance"

export const metadata = {
    title: "Mark Attendance - EduManage",
    description: "School Management System Mark Attendance Page",
}

export default async function MarkAttendancePage() {
    const user = await requireAuth()

    if (!user) {
        redirect("/login")
    }

    return (
        <Layout user={user}>
            {user.role === "admin" && <AdminMarkAttendancePage user={user} />}
        </Layout>
    )
}
