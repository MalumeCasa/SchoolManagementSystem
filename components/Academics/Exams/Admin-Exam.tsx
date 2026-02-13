// app/exams/page.tsx
import { getExams } from '@api/exam-actions';
import { ExamTable } from './components/exam-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function AdminExamsPage({ user }: { user: any }) {
  const examsData = await getExams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Management</h1>
          <p className="text-muted-foreground">
            Create and manage exams, schedules, and results
          </p>
        </div>
        <Button >
          <Link href="/academics/exams/create">
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Exam
          </Link>
        </Button>
      </div>

      {examsData.success && examsData.data ? (
        <ExamTable exams={examsData.data} />
      ) : (
        <div className="text-center text-red-600">
          Failed to load exams: {examsData.error || 'No data available'}
        </div>
      )}
    </div>
  );
}

function PlusIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}