import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import AdminAssignmentsListPage from "@/components/Academics/Assignments/Admin-AssignmentsList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Assignments",
  description: "View and manage all assignments",
};

export default async function AssignmentsListPage() {
  const user = await requireAuth();

  if (!user) {
    redirect("/login");
  }

  return (
    <Layout user={user}>
      {user.role === "admin" && <AdminAssignmentsListPage user={user} />}
    </Layout>
  );
}
