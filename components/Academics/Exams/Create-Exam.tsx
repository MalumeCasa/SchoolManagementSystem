// app/exams/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createExam } from '@api/exam-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

// Mock data - replace with actual API calls
const classes = [
  { id: 1, name: 'Grade 1' },
  { id: 2, name: 'Grade 2' },
  { id: 3, name: 'Grade 3' },
  { id: 4, name: 'Grade 4' },
  { id: 5, name: 'Grade 5' },
];

const subjects = [
  { id: 1, name: 'Mathematics' },
  { id: 2, name: 'English' },
  { id: 3, name: 'Science' },
  { id: 4, name: 'Social Studies' },
  { id: 5, name: 'Computer Science' },
];

export default function CreateExamPage({ user }: { user: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    
    const examData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      examDate: formData.get('examDate') as string,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
      classId: parseInt(formData.get('classId') as string),
      subjectId: parseInt(formData.get('subjectId') as string) || undefined,
      totalMarks: parseInt(formData.get('totalMarks') as string) || 100,
      passingMarks: parseInt(formData.get('passingMarks') as string) || 40,
      academicYear: formData.get('academicYear') as string,
      term: parseInt(formData.get('term') as string),
      weightage: parseInt(formData.get('weightage') as string) || 100,
    };
    
    try {
      const result = await createExam(examData);
      
      if (result.success) {
        toast.success('Exam created successfully');
        router.push('/exams');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to create exam');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  const currentYear = new Date().getFullYear();
  const academicYears = [
    `${currentYear-1}-${currentYear}`,
    `${currentYear}-${currentYear+1}`,
  ];

  return (
    <div className="container mx-auto py-10">
      <Link
        href="/academics/exams"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Exams
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Exam</CardTitle>
          <CardDescription>
            Fill in the details below to create a new exam
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Exam Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Mid-Term Examination"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year *</Label>
                <Select name="academicYear" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter exam description (optional)"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="examDate">Exam Date *</Label>
                <Input
                  id="examDate"
                  name="examDate"
                  type="date"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="classId">Class *</Label>
                <Select name="classId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subjectId">Subject</Label>
                <Select name="subjectId">
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="term">Term *</Label>
                <Select name="term" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Term 1</SelectItem>
                    <SelectItem value="2">Term 2</SelectItem>
                    <SelectItem value="3">Term 3</SelectItem>
                    <SelectItem value="4">Term 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalMarks">Total Marks</Label>
                <Input
                  id="totalMarks"
                  name="totalMarks"
                  type="number"
                  min="1"
                  defaultValue="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passingMarks">Passing Marks</Label>
                <Input
                  id="passingMarks"
                  name="passingMarks"
                  type="number"
                  min="0"
                  defaultValue="40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weightage">Weightage (%)</Label>
                <Input
                  id="weightage"
                  name="weightage"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue="100"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/academics/exams')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                'Creating...'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Exam
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}