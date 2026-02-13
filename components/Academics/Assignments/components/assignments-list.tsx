// components/assignments/assignments-list.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Assignment {
  id: number;
  title: string;
  description?: string;
  assignedDate: string;
  dueDate: string;
  totalMarks: number;
  status: string;
  isPublished: boolean;
  class: {
    id: number;
    name: string;
  };
  subject: {
    id: number;
    name: string;
  };
  teacher: {
    id: number;
    name: string;
  };
  submissionCount: number;
}

interface AssignmentsListProps {
  assignments: Assignment[];
}

export default function AssignmentsList({ assignments }: AssignmentsListProps) {
  const [filter, setFilter] = useState('all');

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true;
    if (filter === 'published') return assignment.isPublished;
    if (filter === 'draft') return !assignment.isPublished;
    return assignment.status === filter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-medium text-black dark:text-white">
            Assignments ({filteredAssignments.length})
          </h3>
          
          <div className="flex gap-2 mt-2 sm:mt-0">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
            >
              <option value="all">All Assignments</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6.5">
        {filteredAssignments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No assignments found.</p>
            <Link href="/assignments/new" className="inline-block mt-4">
              <button className="rounded bg-primary py-2 px-4 font-medium text-white hover:bg-opacity-90">
                Create Your First Assignment
              </button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white">
                    Assignment
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                    Class
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                    Subject
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                    Due Date
                  </th>
                  <th className="min-w-[80px] py-4 px-4 font-medium text-black dark:text-white">
                    Submissions
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                    Status
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b border-stroke dark:border-strokedark">
                    <td className="py-5 px-4">
                      <div>
                        <h4 className="font-medium text-black dark:text-white">
                          {assignment.title}
                        </h4>
                        {assignment.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {assignment.description.length > 100 
                              ? `${assignment.description.substring(0, 100)}...`
                              : assignment.description
                            }
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-black dark:text-white">{assignment.class.name}</p>
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-black dark:text-white">{assignment.subject.name}</p>
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-black dark:text-white">
                        {formatDate(assignment.dueDate)}
                      </p>
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-black dark:text-white">
                        {assignment.submissionCount}
                      </p>
                    </td>
                    <td className="py-5 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(assignment.status)}`}
                      >
                        {assignment.status}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex gap-2">
                        <Link href={`/assignments/${assignment.id}`}>
                          <button className="rounded bg-primary py-1 px-3 text-xs font-medium text-white hover:bg-opacity-90">
                            View
                          </button>
                        </Link>
                        <Link href={`/assignments/${assignment.id}/edit`}>
                          <button className="rounded bg-blue-500 py-1 px-3 text-xs font-medium text-white hover:bg-opacity-90">
                            Edit
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}