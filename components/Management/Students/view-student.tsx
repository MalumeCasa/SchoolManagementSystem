import { notFound } from 'next/navigation';
import { getStudentById } from '@api/student-actions';
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { InferSelectModel } from 'drizzle-orm';
import type { students } from '@lib/db/schema';

// ---------- Types ----------

type Student = InferSelectModel<typeof students>;

interface ViewStudentPageProps {
  params: Promise<{ id: string }>;
}

// ---------- Helpers ----------

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  return isNaN(d.getTime())
    ? value
    : d.toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });
}

function capitalize(value: string | null | undefined): string {
  if (!value) return '—';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// ---------- Sub-components ----------

function StatusBadge({ status }: { status: string | null | undefined }) {
  const normalized = (status ?? 'unknown').toLowerCase();

  const styles: Record<string, string> = {
    active:      'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-400',
    inactive:    'bg-gray-100   text-gray-700   dark:bg-gray-800      dark:text-gray-400',
    suspended:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    graduated:   'bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-400',
    transferred: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    expelled:    'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-400',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${styles[normalized] ?? styles.inactive}`}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {capitalize(status)}
    </span>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </dt>
      <dd className="text-sm text-gray-900 dark:text-white">
        {value ?? <span className="text-gray-400 italic">Not provided</span>}
      </dd>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="dark:bg-boxdark dark:border-strokedark">
      <CardHeader className="border-b border-gray-100 dark:border-strokedark pb-4">
        <CardTitle className="text-base font-semibold text-gray-700 dark:text-gray-300">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          {children}
        </dl>
      </CardContent>
    </Card>
  );
}

// ---------- Page ----------

export default async function ViewStudentPage({ params }: ViewStudentPageProps) {
  const { id } = await params;
  const studentId = parseInt(id, 10);

  if (isNaN(studentId)) notFound();

  const student: Student | null = await getStudentById(studentId);

  if (!student) notFound();

  const fullName = `${student.surname}, ${student.name}`;

  return (
    <div className="space-y-6">
      <Breadcrumb pageName={`Student: ${fullName}`} />

      {/* Header card */}
      <Card className="dark:bg-boxdark dark:border-strokedark">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar initials */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-white select-none">
                {student.name?.charAt(0).toUpperCase()}{student.surname?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{fullName}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  {student.studentId && <span>ID: <strong className="text-gray-700 dark:text-gray-200">{student.studentId}</strong></span>}
                  {student.studentId && student.className && <span>·</span>}
                  {student.className && (
                    <span>
                      Class: <strong className="text-gray-700 dark:text-gray-200">{student.className}{student.classSection ? ` (${student.classSection})` : ''}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
            <StatusBadge status={student.status} />
          </div>
        </CardContent>
      </Card>

      {/* Detail sections */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Personal Information */}
        <SectionCard title="Personal Information">
          <Field label="Surname"      value={student.surname} />
          <Field label="First Name/s" value={student.name} />
          <Field label="Date of Birth" value={formatDate(student.dateOfBirth)} />
          <Field label="Gender"       value={capitalize(student.gender)} />
          <Field label="ID Number"    value={student.idNumber} />
          <Field label="Home Address" value={student.address} />
        </SectionCard>

        {/* Contact Information */}
        <SectionCard title="Contact Information">
          <Field label="Email"        value={student.email} />
          <Field label="Phone"        value={student.phone} />
        </SectionCard>

        {/* Enrollment Information */}
        <SectionCard title="Enrollment Information">
          <Field label="Student ID"      value={student.studentId} />
          <Field label="Class"           value={student.className ? `${student.className}${student.classSection ? ` – ${student.classSection}` : ''}` : undefined} />
          <Field label="Enrollment Date" value={formatDate(student.enrollmentDate)} />
          <Field label="Status"          value={<StatusBadge status={student.status} />} />
          <Field label="Attendance"      value={student.attendance} />
        </SectionCard>

        {/* System Information */}
        <SectionCard title="Record Information">
          <Field label="Created"      value={formatDate(student.createdAt)} />
          <Field label="Last Updated" value={formatDate(student.updatedAt)} />
        </SectionCard>

      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-3 pb-4">
        <Link href="/dashboard/users/students">
          <Button variant="outline">Back to Students</Button>
        </Link>
        <Link href={`/dashboard/users/students/${student.id}/edit`}>
          <Button className="bg-primary hover:bg-opacity-90">Edit Student</Button>
        </Link>
      </div>
    </div>
  );
}

// ---------- Metadata ----------

export async function generateMetadata({ params }: ViewStudentPageProps) {
  try {
    const { id } = await params;
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) return { title: 'Student Not Found' };

    const student: Student | null = await getStudentById(studentId);
    if (!student) return { title: 'Student Not Found' };

    return {
      title: `${student.surname}, ${student.name} — Student Details`,
      description: `View profile for student ${student.name} ${student.surname}`,
    };
  } catch {
    return { title: 'Student Details' };
  }
}