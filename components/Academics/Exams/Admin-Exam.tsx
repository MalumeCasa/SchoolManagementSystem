// app/exams/page.tsx
import { getExams } from '@api/exam-actions';
import { ExamTable } from './components/exam-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export default async function AdminExamsPage({ user }: { user: any }) {
  const examsData = await getExams();

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Management</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage exams, schedules, and results
          </p>
        </div>
        <Link href="/academics/exams/create">
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Exam
          </Button>
        </Link>
      </div>

      {examsData.success && examsData.data ? (
        <ExamTable exams={examsData.data} />
      ) : (
        <div className="text-center py-10 bg-red-50 rounded-lg">
          <p className="text-red-600">Failed to load exams: {examsData.error || 'No data available'}</p>
        </div>
      )}
    </div>
  );
}