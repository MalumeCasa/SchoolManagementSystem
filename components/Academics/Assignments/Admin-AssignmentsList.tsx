// app/assignments/list/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@components/ui-elements/button";
import AssignmentsList from "./components/assignments-list";
import { getAssignments } from "@api/assignments-actions";
import { 
  ArrowLeftIcon,
  PlusIcon,
  DocumentChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  AcademicCapIcon 
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "All Assignments",
  description: "View and manage all assignments",
};

interface UserProps {
  name?: string;
  role?: string;
}

export default async function AdminAssignmentsListPage({ user }: { user: UserProps }) {
  const assignmentsData = await getAssignments();
  const assignments = assignmentsData.success ? assignmentsData.data : [];

  // Single-pass performance optimization for statistics
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const stats = assignments.reduce(
    (acc: any, a: any) => {
      acc.total++;
      if (a.isPublished && a.status === 'published') acc.published++;
      if (!a.isPublished) acc.drafts++;
      if (a.status === 'closed') acc.closed++;

      const dueDate = new Date(a.dueDate);
      if (a.status === 'published' && dueDate >= today && dueDate <= nextWeek) {
        acc.upcoming++;
      }
      return acc;
    },
    { total: 0, published: 0, drafts: 0, closed: 0, upcoming: 0 }
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section with Gradient Background */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-primary-400 p-8 shadow-lg">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Assignments Dashboard</h1>
            <p className="text-white/90 text-lg">Manage and track all academic assignments</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 backdrop-blur-sm">
              <AcademicCapIcon className="h-5 w-5 text-white" />
              <span className="text-white font-medium">Welcome, {user?.name || 'Admin'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Assignments</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="rounded-lg bg-primary-50 p-3 dark:bg-primary-900/20">
              <DocumentChartBarIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 dark:text-green-400">+{stats.published} active</span>
            <span className="text-gray-400 mx-2">•</span>
            <span className="text-gray-500 dark:text-gray-400">{stats.drafts} drafts</span>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.published}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div 
                className="h-2 rounded-full bg-green-500" 
                style={{ width: stats.total ? `${(stats.published / stats.total) * 100}%` : '0%' }}
              ></div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Drafts</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.drafts}</p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
              <DocumentChartBarIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming Deadlines</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">{stats.upcoming}</p>
            </div>
            <div className="rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
              <ClockIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">Next 7 days</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Closed</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.closed}</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
              <CheckCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link href="/academics/assignments">
          <Button
            label="Back to Overview"
            variant="outline"
            shape="rounded"
            size="small"
            icon={<ArrowLeftIcon className="h-4 w-4" />}
            className="!inline-flex !items-center gap-2"
          />
        </Link>
        
        <div className="flex gap-3">
          <Link href="/academics/assignments/new">
            <Button
              label="Create New Assignment"
              variant="primary"
              shape="rounded"
              size="small"
              icon={<PlusIcon className="h-4 w-4" />}
              className="!inline-flex !items-center gap-2 bg-primary-600 hover:bg-primary-700"
            />
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="rounded-2xl bg-white shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Assignments</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View, filter, and manage all assignments across classes
          </p>
        </div>
        <div className="p-6">
          <AssignmentsList 
            assignments={assignments} 
            onDelete={async (id) => {
              'use server';
              // Handle delete
            }}
            onDuplicate={async (id) => {
              'use server';
              // Handle duplicate
            }}
          />
        </div>
      </div>
    </div>
  );
}