// app/exams/components/exam-table.tsx
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Define the Exam type based on your actual data structure
export interface Exam {
  id: number;
  name: string;
  description: string | null;
  examDate: string;
  startTime: string | null;
  endTime: string | null;
  totalMarks: number | null;
  passingMarks: number | null;
  className: string | null;
  subjectName: string | null;
  academicYear: string;
  term: number;
  createdAt: string | null;
}

interface ExamTableProps {
  exams: Exam[];
}

export function ExamTable({ exams }: ExamTableProps) {
  const [loading, setLoading] = useState(false);

  const getExamStatus = (examDate: string) => {
    const today = new Date();
    const examDay = new Date(examDate);
    
    if (examDay < today) return { status: 'Completed', variant: 'default' as const };
    if (examDay.toDateString() === today.toDateString()) return { status: 'Today', variant: 'secondary' as const };
    return { status: 'Upcoming', variant: 'outline' as const };
  };

  const formatTime = (time: string | null) => {
    if (!time) return 'Not set';
    return time;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Exam Name</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Total Marks</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.map((exam) => {
            const status = getExamStatus(exam.examDate);
            return (
              <TableRow key={exam.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{exam.name}</div>
                    {exam.description && (
                      <div className="text-sm text-muted-foreground">
                        {exam.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{exam.className || 'N/A'}</TableCell>
                <TableCell>{exam.subjectName || 'N/A'}</TableCell>
                <TableCell>
                  {formatDate(exam.examDate)}
                </TableCell>
                <TableCell>
                  {exam.startTime && exam.endTime
                    ? `${formatTime(exam.startTime)} - ${formatTime(exam.endTime)}`
                    : 'Not set'}
                </TableCell>
                <TableCell>{exam.totalMarks || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={status.variant}>
                    {status.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" >
                    <Link href={`/exams/${exam.id}/results`}>
                      Results
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" >
                    <Link href={`/exams/${exam.id}/edit`}>
                      Edit
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {exams.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No exams found. Create your first exam to get started.
        </div>
      )}
    </div>
  );
}