// components/assignments/assignments-list.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  CalendarIcon, 
  DocumentTextIcon, 
  ChevronDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  PencilIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentDuplicateIcon,
  UsersIcon,
  BookOpenIcon,
  AcademicCapIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface Assignment {
  id: number;
  title: string;
  description?: string;
  assignedDate: string;
  dueDate: string;
  totalMarks: number;
  passingMarks?: number;
  status: string;
  isPublished: boolean;
  class: {
    id: number;
    name: string;
    section?: string;
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
  totalStudents?: number;
  attachmentUrl?: string;
  attachmentName?: string;
}

interface AssignmentsListProps {
  assignments: Assignment[];
  onDelete?: (id: number) => void | Promise<void>;
  onDuplicate?: (id: number) => void | Promise<void>;
  onBulkAction?: (action: string, ids: number[]) => void | Promise<void>;
}

type SortField = 'title' | 'dueDate' | 'class' | 'subject' | 'status' | 'submissionCount';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'grid' | 'compact';

export default function AssignmentsList({ 
  assignments, 
  onDelete, 
  onDuplicate,
  onBulkAction 
}: AssignmentsListProps) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedAssignments, setSelectedAssignments] = useState<number[]>([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Get unique classes and subjects for filters
  const classOptions = useMemo(() => {
    const classes = new Set(assignments.map(a => a.class.name));
    return ['all', ...Array.from(classes).sort()];
  }, [assignments]);

  const subjectOptions = useMemo(() => {
    const subjects = new Set(assignments.map(a => a.subject.name));
    return ['all', ...Array.from(subjects).sort()];
  }, [assignments]);

  // Filter and sort assignments
  const filteredAssignments = useMemo(() => {
    return assignments
      .filter(assignment => {
        if (filter === 'published' && !assignment.isPublished) return false;
        if (filter === 'draft' && assignment.isPublished) return false;
        if (filter !== 'all' && filter !== 'published' && filter !== 'draft' && assignment.status !== filter) return false;

        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          return (
            assignment.title.toLowerCase().includes(searchLower) ||
            assignment.description?.toLowerCase().includes(searchLower) ||
            assignment.class.name.toLowerCase().includes(searchLower) ||
            assignment.subject.name.toLowerCase().includes(searchLower) ||
            assignment.teacher.name.toLowerCase().includes(searchLower)
          );
        }

        if (selectedClass !== 'all' && assignment.class.name !== selectedClass) return false;
        if (selectedSubject !== 'all' && assignment.subject.name !== selectedSubject) return false;

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'dueDate':
            comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            break;
          case 'class':
            comparison = a.class.name.localeCompare(b.class.name);
            break;
          case 'subject':
            comparison = a.subject.name.localeCompare(b.subject.name);
            break;
          case 'status':
            comparison = a.status.localeCompare(b.status);
            break;
          case 'submissionCount':
            comparison = a.submissionCount - b.submissionCount;
            break;
          default:
            comparison = 0;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [assignments, filter, searchTerm, selectedClass, selectedSubject, sortField, sortDirection]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm, selectedClass, selectedSubject, sortField, sortDirection]);

  // Slice filtered data for pagination
  const paginatedAssignments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAssignments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAssignments, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        formatted: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'overdue',
        days: Math.abs(diffDays)
      };
    } else if (diffDays === 0) {
      return {
        formatted: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'today',
        days: 0
      };
    } else if (diffDays <= 3) {
      return {
        formatted: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'upcoming',
        days: diffDays
      };
    } else {
      return {
        formatted: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'normal',
        days: diffDays
      };
    }
  };

  const getStatusBadge = (status: string, isPublished: boolean) => {
    if (!isPublished) {
      return {
        label: 'Draft',
        color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
        icon: DocumentTextIcon,
        bgColor: 'bg-amber-50 dark:bg-amber-900/20'
      };
    }
    switch (status) {
      case 'published':
        return {
          label: 'Published',
          color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
          icon: CheckCircleIcon,
          bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
        };
      case 'closed':
        return {
          label: 'Closed',
          color: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800',
          icon: XCircleIcon,
          bgColor: 'bg-rose-50 dark:bg-rose-900/20'
        };
      default:
        return {
          label: status,
          color: 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border border-gray-200 dark:border-gray-800',
          icon: DocumentTextIcon,
          bgColor: 'bg-gray-50 dark:bg-gray-900/20'
        };
    }
  };

  const getDueDateBadge = (dueDate: string) => {
    const dateInfo = formatDate(dueDate);
    switch (dateInfo.status) {
      case 'overdue':
        return {
          color: 'text-rose-600 dark:text-rose-400',
          bgColor: 'bg-rose-50 dark:bg-rose-900/20',
          borderColor: 'border-rose-200 dark:border-rose-800',
          icon: ExclamationTriangleIcon,
          text: `${dateInfo.days} ${dateInfo.days === 1 ? 'day' : 'days'} overdue`
        };
      case 'today':
        return {
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
          icon: ClockIcon,
          text: 'Due today'
        };
      case 'upcoming':
        return {
          color: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-800',
          icon: ClockIcon,
          text: `${dateInfo.days} ${dateInfo.days === 1 ? 'day' : 'days'} left`
        };
      default:
        return {
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          icon: CalendarIcon,
          text: dateInfo.formatted
        };
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAllVisible = () => {
    const visibleIds = paginatedAssignments.map(a => a.id);
    const allVisibleSelected = visibleIds.every(id => selectedAssignments.includes(id));
    
    if (allVisibleSelected) {
      // Deselect visible
      setSelectedAssignments(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      // Select visible
      setSelectedAssignments(prev => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const handleSelectAssignment = (id: number) => {
    setSelectedAssignments(prev => 
      prev.includes(id) ? prev.filter(assignmentId => assignmentId !== id) : [...prev, id]
    );
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return (
      <span className="opacity-0 group-hover:opacity-50 ml-1">
        <ChevronDownIcon className="w-4 h-4" />
      </span>
    );
    return sortDirection === 'asc' ? 
      <ArrowUpIcon className="w-4 h-4 inline ml-1 text-primary" /> : 
      <ArrowDownIcon className="w-4 h-4 inline ml-1 text-primary" />;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedClass('all');
    setSelectedSubject('all');
    setFilter('all');
  };

  const activeFilterCount = [
    filter !== 'all',
    searchTerm !== '',
    selectedClass !== 'all',
    selectedSubject !== 'all'
  ].filter(Boolean).length;

  // Render table view
  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <th className="py-4 pl-4 pr-2">
              <input
                type="checkbox"
                checked={paginatedAssignments.length > 0 && paginatedAssignments.every(a => selectedAssignments.includes(a.id))}
                onChange={handleSelectAllVisible}
                className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
              />
            </th>
            <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group" onClick={() => handleSort('title')}>
              <div className="flex items-center gap-1">Assignment <SortIcon field="title" /></div>
            </th>
            <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group" onClick={() => handleSort('class')}>
              <div className="flex items-center gap-1">Class <SortIcon field="class" /></div>
            </th>
            <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group" onClick={() => handleSort('subject')}>
              <div className="flex items-center gap-1">Subject <SortIcon field="subject" /></div>
            </th>
            <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group" onClick={() => handleSort('dueDate')}>
              <div className="flex items-center gap-1">Due Date <SortIcon field="dueDate" /></div>
            </th>
            <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group" onClick={() => handleSort('submissionCount')}>
              <div className="flex items-center gap-1">Submissions <SortIcon field="submissionCount" /></div>
            </th>
            <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group" onClick={() => handleSort('status')}>
              <div className="flex items-center gap-1">Status <SortIcon field="status" /></div>
            </th>
            <th className="py-4 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          <AnimatePresence>
            {paginatedAssignments.map((assignment, index) => {
              const statusBadge = getStatusBadge(assignment.status, assignment.isPublished);
              const StatusIcon = statusBadge.icon;
              const dueDateInfo = getDueDateBadge(assignment.dueDate);
              const DueDateIcon = dueDateInfo.icon;
              const submissionRate = assignment.totalStudents 
                ? Math.round((assignment.submissionCount / assignment.totalStudents) * 100) : null;

              return (
                <motion.tr
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                >
                  <td className="py-4 pl-4 pr-2">
                    <input
                      type="checkbox"
                      checked={selectedAssignments.includes(assignment.id)}
                      onChange={() => handleSelectAssignment(assignment.id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${statusBadge.bgColor}`}>
                        <DocumentTextIcon className={`h-5 w-5 ${statusBadge.color.split(' ')[1]}`} />
                      </div>
                      <div>
                        <Link href={`/assignments/${assignment.id}`} className="hover:text-primary transition-colors">
                          <h4 className="font-medium text-gray-900 dark:text-white">{assignment.title}</h4>
                        </Link>
                        {assignment.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 max-w-md">{assignment.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <AcademicCapIcon className="h-3.5 w-3.5" /> Marks: {assignment.totalMarks}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{assignment.class.name}</span>
                      {assignment.class.section && <span className="text-xs text-gray-500 dark:text-gray-400">Section {assignment.class.section}</span>}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      <BookOpenIcon className="h-3.5 w-3.5" />{assignment.subject.name}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${dueDateInfo.bgColor} ${dueDateInfo.color} border ${dueDateInfo.borderColor}`}>
                      <DueDateIcon className="h-4 w-4" /><span>{dueDateInfo.text}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <UsersIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{assignment.submissionCount}</span>
                      </div>
                      {submissionRate !== null && (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                            <motion.div 
                              initial={{ width: 0 }} animate={{ width: `${submissionRate}%` }} transition={{ duration: 0.5, delay: index * 0.1 }}
                              className={`h-full ${submissionRate >= 75 ? 'bg-emerald-500' : submissionRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            />
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{submissionRate}%</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                      <StatusIcon className="h-4 w-4" />{statusBadge.label}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/assignments/${assignment.id}`}>
                        <button className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="View"><EyeIcon className="h-4 w-4" /></button>
                      </Link>
                      <Link href={`/assignments/${assignment.id}/edit`}>
                        <button className="p-2 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors dark:text-blue-400" title="Edit"><PencilIcon className="h-4 w-4" /></button>
                      </Link>
                      {onDelete && (
                        <button onClick={() => onDelete(assignment.id)} className="p-2 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors dark:text-rose-400" title="Delete"><XCircleIcon className="h-4 w-4" /></button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );

  // Render grid view
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      <AnimatePresence>
        {paginatedAssignments.map((assignment, index) => {
          const statusBadge = getStatusBadge(assignment.status, assignment.isPublished);
          const StatusIcon = statusBadge.icon;
          const dueDateInfo = getDueDateBadge(assignment.dueDate);
          const DueDateIcon = dueDateInfo.icon;
          const submissionRate = assignment.totalStudents 
            ? Math.round((assignment.submissionCount / assignment.totalStudents) * 100) : null;

          return (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative"
            >
              <div className={`h-2 ${statusBadge.bgColor}`} />
              <div className="absolute top-4 left-4 z-10">
                <input
                  type="checkbox"
                  checked={selectedAssignments.includes(assignment.id)}
                  onChange={() => handleSelectAssignment(assignment.id)}
                  className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 shadow-sm"
                />
              </div>
              <div className="p-6 pt-8">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${statusBadge.bgColor}`}>
                    <DocumentTextIcon className={`h-6 w-6 ${statusBadge.color.split(' ')[1]}`} />
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                    <StatusIcon className="h-3.5 w-3.5" />{statusBadge.label}
                  </span>
                </div>

                <Link href={`/assignments/${assignment.id}`} className="block group">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors mb-2">{assignment.title}</h3>
                </Link>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpenIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">{assignment.subject.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <UsersIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">{assignment.class.name}</span>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${dueDateInfo.bgColor} ${dueDateInfo.color} border ${dueDateInfo.borderColor}`}>
                    <DueDateIcon className="h-4 w-4" /><span>{dueDateInfo.text}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Submissions</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{assignment.submissionCount}/{assignment.totalStudents || '?'}</span>
                  </div>
                  {submissionRate !== null && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                        <motion.div 
                          initial={{ width: 0 }} animate={{ width: `${submissionRate}%` }} transition={{ duration: 0.5 }}
                          className={`h-full ${submissionRate >= 75 ? 'bg-emerald-500' : submissionRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{submissionRate}%</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );

  // Render compact view
  const renderCompactView = () => (
    <div className="space-y-2 p-4">
      <AnimatePresence>
        {paginatedAssignments.map((assignment, index) => {
          const statusBadge = getStatusBadge(assignment.status, assignment.isPublished);
          const StatusIcon = statusBadge.icon;
          const dueDateInfo = getDueDateBadge(assignment.dueDate);
          const DueDateIcon = dueDateInfo.icon;

          return (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-all"
            >
              <input
                type="checkbox"
                checked={selectedAssignments.includes(assignment.id)}
                onChange={() => handleSelectAssignment(assignment.id)}
                className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
              />
              <div className={`p-2 rounded-lg ${statusBadge.bgColor}`}>
                <DocumentTextIcon className={`h-4 w-4 ${statusBadge.color.split(' ')[1]}`} />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/assignments/${assignment.id}`} className="hover:text-primary">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">{assignment.title}</h4>
                </Link>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span>{assignment.class.name}</span><span>•</span><span>{assignment.subject.name}</span>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs ${dueDateInfo.bgColor} ${dueDateInfo.color}`}>
                <DueDateIcon className="h-3 w-3" /><span>{dueDateInfo.text}</span>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusBadge.color}`}>
                <StatusIcon className="h-3 w-3" />{statusBadge.label}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center gap-2 rounded-lg border ${
                    showFilters || activeFilterCount > 0 ? 'border-primary bg-primary/10 text-primary' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } px-4 py-2.5 text-sm font-medium transition-colors`}
                >
                  <FunnelIcon className="h-5 w-5" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">{activeFilterCount}</span>
                  )}
                </button>

                {/* View Mode Toggle */}
                <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                  <button onClick={() => setViewMode('table')} className={`px-3 py-2.5 text-sm font-medium ${viewMode === 'table' ? 'bg-primary text-white' : 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700'}`}>Table</button>
                  <button onClick={() => setViewMode('grid')} className={`px-3 py-2.5 text-sm font-medium border-l border-gray-300 dark:border-gray-600 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700'}`}>Grid</button>
                  <button onClick={() => setViewMode('compact')} className={`px-3 py-2.5 text-sm font-medium border-l border-gray-300 dark:border-gray-600 ${viewMode === 'compact' ? 'bg-primary text-white' : 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700'}`}>Compact</button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                      <select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm focus:border-primary dark:bg-gray-700">
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Class</label>
                      <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm focus:border-primary dark:bg-gray-700">
                        {classOptions.map(option => <option key={option} value={option}>{option === 'all' ? 'All Classes' : option}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                      <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm focus:border-primary dark:bg-gray-700">
                        {subjectOptions.map(option => <option key={option} value={option}>{option === 'all' ? 'All Subjects' : option}</option>)}
                      </select>
                    </div>
                    <div className="flex items-end"><button onClick={clearFilters} className="text-sm text-primary hover:text-primary/80 font-medium pb-2">Clear all filters</button></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedAssignments.length > 0 && (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <span className="text-sm font-medium text-primary-900 dark:text-primary-100">{selectedAssignments.length} selected</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedAssignments([])} className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900">Clear</button>
                {onBulkAction && (
                  <>
                    <button onClick={() => onBulkAction('publish', selectedAssignments)} className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">Publish</button>
                    <button onClick={() => onBulkAction('delete', selectedAssignments)} className="px-3 py-1.5 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600">Delete</button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{filteredAssignments.length} Assignments</h3>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {filteredAssignments.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex p-4 rounded-full bg-gray-100 dark:bg-gray-700 mb-4"><DocumentTextIcon className="h-12 w-12 text-gray-400" /></div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No assignments found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            {viewMode === 'table' && renderTableView()}
            {viewMode === 'grid' && renderGridView()}
            {viewMode === 'compact' && renderCompactView()}
          </>
        )}

        {/* Dynamic Pagination Footer */}
        {filteredAssignments.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-700 p-4 gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <p>
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredAssignments.length)}</span> of{' '}
                <span className="font-medium">{filteredAssignments.length}</span> results
              </p>
              
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to page 1 when changing items per page
                }}
                className="bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs focus:outline-none focus:border-primary"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1 px-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}