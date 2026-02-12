// app/staff/layout.tsx
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth();

  if (!user) {
    redirect("/login");
  }

  // Only allow admin and teacher to access staff pages
  if (user.role !== "admin" && user.role !== "teacher") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}