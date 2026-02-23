import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import AddStaffPage from "@components/Staff/new-staff";


export const metadata = {
  title: "Add Staff - Kiddies Town School Management System",
  description: "School Management System Add New Staff",
};

export default async function StaffPage() {
  const user = await requireAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <Layout user={user}>
      {user.role === "admin"? <AddStaffPage user={user} /> : null}
      
    </Layout>
  );
}