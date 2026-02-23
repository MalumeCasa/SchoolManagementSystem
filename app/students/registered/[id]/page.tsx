import { notFound } from "next/navigation";
import { getRegisteredStudentFull, getRegisteredStudentByStudentsId } from "@api/student-actions";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ViewRegisteredStudentForm from "@components/Management/Students/view-registered-student-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function resolveStudent(id: number) {
  // Case B: direct registered_students PK
  const byRegId = await getRegisteredStudentFull(id);
  if (byRegId) return byRegId;

  // Case A: id is a students.id -- follow the FK to registered_students
  const byStudentsId = await getRegisteredStudentByStudentsId(id);
  if (byStudentsId) return byStudentsId;

  return null;
}

export default async function ViewRegisteredStudentPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) notFound();

  const student = await resolveStudent(numericId);

  if (!student) notFound();

  return (
    <>
      <Breadcrumb pageName={`View Registration: ${student.surname}, ${student.name}`} />
      <ViewRegisteredStudentForm student={student} />
    </>
  );
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return { title: "Student Not Found" };

    const student = await resolveStudent(numericId);
    if (!student) return { title: "Student Not Found" };

    const sid = student.studentId ? ` (${student.studentId})` : "";
    return {
      title: `${student.surname}, ${student.name}${sid} -- Registration Record`,
      description: `View full registration record for ${student.name} ${student.surname}`,
    };
  } catch {
    return { title: "Student Registration Record" };
  }
}