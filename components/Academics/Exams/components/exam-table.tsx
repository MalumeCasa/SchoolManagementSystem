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
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deleteExam } from '@api/exam-actions';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Eye, 
  ClipboardList,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Exam {
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
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredExams = exams.filter(exam => 
    exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.academicYear.includes(searchTerm)
  );

  const handleDelete = async (id: number) => {
    setSelectedExam(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedExam) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteExam(selectedExam);
      if (result.success) {
        toast.success('Exam deleted successfully');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to delete exam');
      }
    } catch (error) {
      toast.error('An error occurred while deleting');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedExam(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '—';
    return timeString.substring(0, 5); // Show HH:MM format
  };

  const getStatusBadge = (examDate: string) => {
    const examDateObj = new Date(examDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (examDateObj < today) {
      return <Badge variant="secondary">Completed</Badge>;
    } else if (examDateObj.toDateString() === today.toDateString()) {
      return <Badge variant="default">Today</Badge>;
    } else {
      return <Badge variant="outline">Upcoming</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Exams</CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exams by name, class, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No exams found
                  </TableCell>
                </TableRow>
              ) : (
                filteredExams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">
                      <div>
                        {exam.name}
                        {exam.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {exam.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{exam.className || '—'}</TableCell>
                    <TableCell>{exam.subjectName || '—'}</TableCell>
                    <TableCell>{formatDate(exam.examDate)}</TableCell>
                    <TableCell>
                      {exam.startTime && exam.endTime ? (
                        <span className="text-sm">
                          {formatTime(exam.startTime)} - {formatTime(exam.endTime)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>Term {exam.term}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Total: {exam.totalMarks || '—'}</div>
                        <div className="text-muted-foreground">
                          Pass: {exam.passingMarks || '—'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(exam.examDate)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/exams/${exam.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/exams/${exam.id}/results`}>
                              <ClipboardList className="mr-2 h-4 w-4" />
                              Manage Results
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/exams/${exam.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(exam.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredExams.length} of {exams.length} exams
        </div>
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the exam
              and all associated results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}