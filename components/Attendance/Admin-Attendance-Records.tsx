'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Status = 'present' | 'absent' | 'late' | 'half-day';
type StatusFilter = '' | Status;
type SortField = 'studentName' | 'className' | 'date' | 'status' | 'createdAt' | 'attendanceRate';
type SortDir = 'asc' | 'desc';
type ViewMode = 'table' | 'cards' | 'calendar';
type DateRange = 'today' | 'week' | 'month' | 'custom';

interface AttendanceRecord {
  id: number;
  studentId: number;
  classId: number;
  date: string;
  status: Status;
  subjectId?: number | null;
  remarks?: string | null;
  recordedBy?: number | null;
  createdAt: string | null;
  studentName?: string;
  className?: string | null;
  studentEmail?: string;
  parentContact?: string;
}

interface Student {
  id: number;
  name: string;
  classId: number;
  className: string;
  email: string;
  parentName: string;
  parentPhone: string;
  enrollmentDate: string;
  attendanceRate: number;
  totalDays: number;
  presentDays: number;
}

interface ClassSummary {
  id: number;
  name: string;
  grade: string;
  section: string;
  totalStudents: number;
  teacher: string;
  attendanceToday: number;
  averageRate: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data Generator
// ─────────────────────────────────────────────────────────────────────────────
const generateMockData = () => {
  // Classes
  const CLASSES = [
    { id: 1, name: 'Grade 8A', grade: '8', section: 'A', teacher: 'Ms. Johnson', totalStudents: 28 },
    { id: 2, name: 'Grade 8B', grade: '8', section: 'B', teacher: 'Mr. Smith', totalStudents: 26 },
    { id: 3, name: 'Grade 9A', grade: '9', section: 'A', teacher: 'Mrs. Davis', totalStudents: 30 },
    { id: 4, name: 'Grade 9B', grade: '9', section: 'B', teacher: 'Mr. Wilson', totalStudents: 29 },
    { id: 5, name: 'Grade 10A', grade: '10', section: 'A', teacher: 'Ms. Brown', totalStudents: 27 },
    { id: 6, name: 'Grade 10B', grade: '10', section: 'B', teacher: 'Mr. Taylor', totalStudents: 25 },
  ];

  // Students
  const FIRST_NAMES = [
    'Amara', 'Liam', 'Zara', 'Ethan', 'Sofia', 'Kwame', 'Isla', 'Jayden', 'Nadia', 'Omar',
    'Priya', 'Caleb', 'Leila', 'Noah', 'Tumi', 'Aisha', 'Marcus', 'Yemi', 'Cara', 'Sipho',
    'Emma', 'Lucas', 'Olivia', 'Mason', 'Ava', 'Elijah', 'Sophia', 'James', 'Mia', 'Benjamin',
    'Charlotte', 'Alexander', 'Amelia', 'William', 'Harper', 'Michael', 'Evelyn', 'Daniel', 'Abigail', 'Matthew'
  ];
  
  const LAST_NAMES = [
    'Osei', 'Patel', 'Mokoena', 'Nkosi', 'Dlamini', 'Boateng', 'Ferreira', 'Sithole', 'Fourie', 'Hendricks',
    'Ramsamy', 'Joubert', 'Mahlangu', 'van Wyk', 'Khumalo', 'Petersen', 'Swanepoel', 'Adeyemi', 'du Plessis', 'Zulu',
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'
  ];

  const students: Student[] = [];
  let id = 1000;

  CLASSES.forEach(cls => {
    for (let i = 0; i < cls.totalStudents; i++) {
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const presentDays = Math.floor(Math.random() * 80) + 20; // 20-100 days
      const totalDays = 100;
      
      students.push({
        id: id++,
        name: `${firstName} ${lastName}`,
        classId: cls.id,
        className: cls.name,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@school.edu`,
        parentName: `${['Mr.', 'Mrs.', 'Dr.'][Math.floor(Math.random() * 3)]} ${lastName}`,
        parentPhone: `+27${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
        enrollmentDate: `2024-01-${Math.floor(Math.random() * 15) + 1}`.padStart(10, '0'),
        attendanceRate: Math.round((presentDays / totalDays) * 100),
        totalDays,
        presentDays,
      });
    }
  });

  // Generate attendance records for the last 30 days
  const records: AttendanceRecord[] = [];
  const today = new Date();
  const statuses: Status[] = ['present', 'absent', 'late', 'half-day'];
  const remarks = [
    '', '', '', '', '', '', '', '', '', '',
    'Sick leave', 'Family emergency', 'Doctor appointment', 'Traffic', 'Bus delay',
    'Overslept', 'Early pickup', 'No reason given', 'Medical appointment', 'Weather conditions'
  ];

  students.forEach(student => {
    // Generate records for last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      // Weighted random for realistic distribution
      const rand = Math.random();
      let status: Status;
      if (rand < 0.75) status = 'present';
      else if (rand < 0.85) status = 'absent';
      else if (rand < 0.95) status = 'late';
      else status = 'half-day';

      // Create record
      records.push({
        id: records.length + 1,
        studentId: student.id,
        classId: student.classId,
        studentName: student.name,
        className: student.className,
        date: dateStr,
        status,
        remarks: Math.random() > 0.7 ? remarks[Math.floor(Math.random() * remarks.length)] : '',
        createdAt: `${dateStr}T${String(Math.floor(Math.random() * 3) + 8).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00Z`,
        recordedBy: Math.floor(Math.random() * 5) + 1,
      });
    }
  });

  // Class summaries
  const classSummaries: ClassSummary[] = CLASSES.map(cls => {
    const classStudents = students.filter(s => s.classId === cls.id);
    const todayRecords = records.filter(r => 
      r.classId === cls.id && r.date === today.toISOString().split('T')[0]
    );
    const presentToday = todayRecords.filter(r => r.status === 'present').length;
    
    return {
      id: cls.id,
      name: cls.name,
      grade: cls.grade,
      section: cls.section,
      totalStudents: cls.totalStudents,
      teacher: cls.teacher,
      attendanceToday: presentToday,
      averageRate: Math.round(classStudents.reduce((sum, s) => sum + s.attendanceRate, 0) / classStudents.length),
    };
  });

  return { students, records, classSummaries, classes: CLASSES };
};

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Helpers
// ─────────────────────────────────────────────────────────────────────────────
const { students: MOCK_STUDENTS, records: MOCK_RECORDS, classSummaries: MOCK_CLASSES, classes } = generateMockData();

const STATUSES: { value: StatusFilter; label: string; icon: string; color: string }[] = [
  { value: '', label: 'All', icon: '○', color: 'slate' },
  { value: 'present', label: 'Present', icon: '✓', color: 'emerald' },
  { value: 'absent', label: 'Absent', icon: '✗', color: 'red' },
  { value: 'late', label: 'Late', icon: '⏱', color: 'amber' },
  { value: 'half-day', label: 'Half Day', icon: '◑', color: 'violet' },
];

const STATUS_STYLE: Record<string, {
  dot: string; badge: string; badgeBorder: string; badgeText: string;
  rowAccent: string; cardBorder: string; iconBg: string; iconText: string;
  gradient: string;
}> = {
  present: {
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50', badgeBorder: 'border-emerald-200', badgeText: 'text-emerald-700',
    rowAccent: 'border-l-emerald-400',
    cardBorder: 'border-emerald-200 hover:border-emerald-400',
    iconBg: 'bg-emerald-100', iconText: 'text-emerald-700',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  absent: {
    dot: 'bg-red-500',
    badge: 'bg-red-50', badgeBorder: 'border-red-200', badgeText: 'text-red-700',
    rowAccent: 'border-l-red-400',
    cardBorder: 'border-red-200 hover:border-red-400',
    iconBg: 'bg-red-100', iconText: 'text-red-700',
    gradient: 'from-red-500 to-red-600',
  },
  late: {
    dot: 'bg-amber-500',
    badge: 'bg-amber-50', badgeBorder: 'border-amber-200', badgeText: 'text-amber-700',
    rowAccent: 'border-l-amber-400',
    cardBorder: 'border-amber-200 hover:border-amber-400',
    iconBg: 'bg-amber-100', iconText: 'text-amber-700',
    gradient: 'from-amber-500 to-amber-600',
  },
  'half-day': {
    dot: 'bg-violet-500',
    badge: 'bg-violet-50', badgeBorder: 'border-violet-200', badgeText: 'text-violet-700',
    rowAccent: 'border-l-violet-400',
    cardBorder: 'border-violet-200 hover:border-violet-400',
    iconBg: 'bg-violet-100', iconText: 'text-violet-700',
    gradient: 'from-violet-500 to-violet-600',
  },
};

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────
const fmtDate = (d: string) => {
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fmtDateLong = (d: string) => {
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const fmtTime = (d: string) => {
  const date = new Date(d);
  return date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
};

const fmtRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return fmtDate(dateStr);
};

const initials = (name: string) => {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
};

const exportCSV = (records: AttendanceRecord[], filename?: string) => {
  const header = ['ID', 'Student', 'Class', 'Date', 'Status', 'Remarks', 'Recorded At', 'Recorded By'];
  const rows = records.map(r => [
    r.id,
    r.studentName ?? `Student ${r.studentId}`,
    r.className ?? `Class ${r.classId}`,
    r.date,
    r.status,
    r.remarks ?? '',
    r.createdAt ? fmtTime(r.createdAt) : '',
    r.recordedBy ?? '',
  ]);
  
  const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `attendance_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ─────────────────────────────────────────────────────────────────────────────
// Small Components
// ─────────────────────────────────────────────────────────────────────────────
function Avatar({ name, id, size = 'md' }: { name: string; id: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  };
  
  return (
    <span className={`inline-flex rounded-full items-center justify-center font-bold flex-shrink-0 ${sizeClasses[size]} ${AVATAR_COLORS[id % AVATAR_COLORS.length]}`}>
      {initials(name)}
    </span>
  );
}

function StatusPill({ status, size = 'md' }: { status: string; size?: 'sm' | 'md' }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.absent;
  const label = status === 'half-day' ? 'Half Day' : status.charAt(0).toUpperCase() + status.slice(1);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${s.badge} ${s.badgeBorder} ${s.badgeText} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {label}
    </span>
  );
}

function SortChevrons({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={`inline-flex flex-col gap-px ml-1 transition-opacity ${active ? 'opacity-100' : 'opacity-20 group-hover:opacity-50'}`}>
      <svg className={`w-2 h-2 ${active && dir === 'asc' ? 'text-blue-600' : 'text-slate-400'}`} fill="currentColor" viewBox="0 0 8 5">
        <path d="M4 0L8 5H0z" />
      </svg>
      <svg className={`w-2 h-2 ${active && dir === 'desc' ? 'text-blue-600' : 'text-slate-400'}`} fill="currentColor" viewBox="0 0 8 5">
        <path d="M4 5L0 0h8z" />
      </svg>
    </span>
  );
}

function StatCard({ 
  title, 
  value, 
  change, 
  icon, 
  color,
  trend 
}: { 
  title: string; 
  value: string | number; 
  change?: string; 
  icon: React.ReactNode; 
  color: string;
  trend?: 'up' | 'down';
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2.5 rounded-lg bg-${color}-50`}>
          {icon}
        </div>
        {change && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {trend === 'up' ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
      <p className="text-sm text-slate-600 mb-0.5">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="w-4 h-4 bg-slate-100 rounded animate-pulse" />
          <div className="w-8 h-8 bg-slate-100 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-100 rounded animate-pulse w-36" />
            <div className="h-2.5 bg-slate-100 rounded animate-pulse w-20" />
          </div>
          <div className="h-6 w-16 bg-slate-100 rounded-full animate-pulse" />
          <div className="h-3 w-20 bg-slate-100 rounded animate-pulse hidden sm:block" />
          <div className="h-3 w-24 bg-slate-100 rounded animate-pulse hidden md:block" />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function AttendanceRecordsPage({user}: { user: any }) {
  // ── State ─────────────────────────────────────────────────────────────────
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>('today');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortField, setSortField] = useState<SortField>('studentName');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  
  const searchRef = useRef<HTMLInputElement>(null);
  const ROWS_PER_PAGE = 10;

  // ── Load Data ────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setRecords(MOCK_RECORDS);
      } catch (error) {
        showToast('Failed to load records', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // ── Derived Data ─────────────────────────────────────────────────────────
  const teachers = useMemo(() => {
    const unique = new Set(classes.map(c => c.teacher));
    return Array.from(unique);
  }, []);

  const filteredRecords = useMemo(() => {
    let filtered = records;

    // Apply class filter
    if (selectedClass) {
      filtered = filtered.filter(r => r.classId === parseInt(selectedClass));
    }

    // Apply date filter
    if (selectedDate) {
      filtered = filtered.filter(r => r.date === selectedDate);
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Apply search
    if (search.trim()) {
      const query = search.toLowerCase().trim();
      filtered = filtered.filter(r => 
        (r.studentName?.toLowerCase().includes(query) ?? false) ||
        (r.className?.toLowerCase().includes(query) ?? false) ||
        (r.remarks?.toLowerCase().includes(query) ?? false)
      );
    }

    return filtered;
  }, [records, selectedClass, selectedDate, statusFilter, search]);

  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let aVal = a[sortField as keyof AttendanceRecord];
      let bVal = b[sortField as keyof AttendanceRecord];
      
      if (sortField === 'attendanceRate') {
        const aStudent = MOCK_STUDENTS.find(s => s.id === a.studentId);
        const bStudent = MOCK_STUDENTS.find(s => s.id === b.studentId);
        aVal = aStudent?.attendanceRate ?? 0;
        bVal = bStudent?.attendanceRate ?? 0;
      }
      
      const aStr = String(aVal ?? '').toLowerCase();
      const bStr = String(bVal ?? '').toLowerCase();
      
      return sortDir === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filteredRecords, sortField, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / ROWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * ROWS_PER_PAGE;
  const pageRecords = sortedRecords.slice(pageStart, pageStart + ROWS_PER_PAGE);

  // Statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(r => r.date === today);
    
    return {
      total: records.length,
      today: todayRecords.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      halfDay: records.filter(r => r.status === 'half-day').length,
      presentToday: todayRecords.filter(r => r.status === 'present').length,
      absentToday: todayRecords.filter(r => r.status === 'absent').length,
      lateToday: todayRecords.filter(r => r.status === 'late').length,
      attendanceRate: records.length > 0 
        ? Math.round((records.filter(r => r.status === 'present').length / records.length) * 100)
        : 0,
    };
  }, [records]);

  // Selection
  const pageIds = pageRecords.map(r => r.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every(id => selected.has(id));
  const someSelected = pageIds.some(id => selected.has(id)) && !allPageSelected;
  const indRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (indRef.current) {
      indRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const toggleAll = () => {
    setSelected(prev => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageIds.forEach(id => next.delete(id));
      } else {
        pageIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  const toggleOne = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExport = () => {
    const toExport = selected.size > 0
      ? sortedRecords.filter(r => selected.has(r.id))
      : sortedRecords;
    
    exportCSV(toExport);
    showToast(`Exported ${toExport.length} records`, 'success');
  };

  const handleBulkAction = (action: 'email' | 'sms' | 'print') => {
    if (selected.size === 0) {
      showToast('Please select records first', 'error');
      return;
    }
    
    const actions = {
      email: 'Emails sent',
      sms: 'SMS notifications sent',
      print: 'Print job initiated',
    };
    
    showToast(`${actions[action]} to ${selected.size} parents`, 'success');
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setRecords(MOCK_RECORDS);
      setIsLoading(false);
      showToast('Records refreshed', 'info');
    }, 500);
  };

  const clearFilters = () => {
    setSelectedClass('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setStatusFilter('');
    setSearch('');
    setSelectedTeacher('');
    setCurrentPage(1);
    searchRef.current?.focus();
  };

  const hasFilters = !!(selectedClass || statusFilter || search.trim() || selectedTeacher);

  // Page numbers for pagination
  const pageNumbers: (number | '…')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1);
    if (safePage > 3) pageNumbers.push('…');
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
      pageNumbers.push(i);
    }
    if (safePage < totalPages - 2) pageNumbers.push('…');
    pageNumbers.push(totalPages);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Attendance Records
              </h1>
            </div>
            <span className="hidden sm:inline-block w-px h-6 bg-slate-200" />
            <p className="hidden sm:block text-sm text-slate-500">
              {fmtDateLong(selectedDate)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selected.size > 0 && (
              <div className="hidden md:flex items-center gap-2 mr-2">
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                  {selected.size} selected
                </span>
                <button
                  onClick={() => handleBulkAction('email')}
                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Email parents"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleBulkAction('sms')}
                  className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Send SMS"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelected(new Set())}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Clear selection"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            
            <button
              onClick={handleRefresh}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Refresh"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <Link
              href="/attendance/mark"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Mark Attendance
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Records"
            value={stats.total.toLocaleString()}
            change="+12%"
            trend="up"
            color="blue"
            icon={
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <StatCard
            title="Today"
            value={stats.today}
            icon={
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            color="emerald"
          />
          <StatCard
            title="Present"
            value={stats.present}
            change="+5%"
            trend="up"
            color="emerald"
            icon={
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Absent"
            value={stats.absent}
            change="-2%"
            trend="down"
            color="red"
            icon={
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Late"
            value={stats.late}
            color="amber"
            icon={
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Rate"
            value={`${stats.attendanceRate}%`}
            color="violet"
            icon={
              <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 0120.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            }
          />
        </div>

        {/* Class Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {MOCK_CLASSES.map(cls => (
            <button
              key={cls.id}
              onClick={() => setSelectedClass(cls.id.toString())}
              className={`p-4 rounded-xl border transition-all ${
                selectedClass === cls.id.toString()
                  ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                  : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-md'
              }`}
            >
              <div className="text-sm font-semibold text-slate-900">{cls.name}</div>
              <div className="text-xs text-slate-500 mt-1">{cls.teacher}</div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-slate-400">Present</span>
                <span className="text-sm font-bold text-emerald-600">{cls.attendanceToday}/{cls.totalStudents}</span>
              </div>
              <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                  style={{ width: `${(cls.attendanceToday / cls.totalStudents) * 100}%` }}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search students, classes, remarks..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-8 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Class Select */}
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer min-w-[140px]"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>

            {/* Teacher Select */}
            <select
              value={selectedTeacher}
              onChange={e => setSelectedTeacher(e.target.value)}
              className="h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer min-w-[140px]"
            >
              <option value="">All Teachers</option>
              {teachers.map(teacher => (
                <option key={teacher} value={teacher}>{teacher}</option>
              ))}
            </select>

            {/* Date Input */}
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Status Tabs */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1">
              {STATUSES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setStatusFilter(s.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    statusFilter === s.value
                      ? `bg-${s.color}-600 text-white shadow-sm`
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white'
                  }`}
                >
                  <span className="mr-1">{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1">
              {(['table', 'cards', 'calendar'] as ViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === mode
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {mode === 'table' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  )}
                  {mode === 'cards' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h4v4H4zM10 5h4v4h-4zM16 5h4v4h-4zM4 11h4v4H4zM10 11h4v4h-4zM16 11h4v4h-4zM4 17h4v4H4zM10 17h4v4h-4zM16 17h4v4h-4z" />
                    </svg>
                  )}
                  {mode === 'calendar' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="h-10 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>

            {/* Clear Filters */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="h-10 px-4 text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Active Filter Chips */}
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-400">Active filters:</span>
              {selectedClass && (
                <span className="inline-flex items-center gap-1 pl-2 pr-1 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  Class: {classes.find(c => c.id === parseInt(selectedClass))?.name}
                  <button onClick={() => setSelectedClass('')} className="ml-0.5 p-0.5 rounded-full hover:bg-blue-200">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center gap-1 pl-2 pr-1 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  Status: {STATUSES.find(s => s.value === statusFilter)?.label}
                  <button onClick={() => setStatusFilter('')} className="ml-0.5 p-0.5 rounded-full hover:bg-blue-200">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {selectedTeacher && (
                <span className="inline-flex items-center gap-1 pl-2 pr-1 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  Teacher: {selectedTeacher}
                  <button onClick={() => setSelectedTeacher('')} className="ml-0.5 p-0.5 rounded-full hover:bg-blue-200">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 pl-2 pr-1 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  Search: "{search}"
                  <button onClick={() => setSearch('')} className="ml-0.5 p-0.5 rounded-full hover:bg-blue-200">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Table Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-3">
              {isLoading ? (
                <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
              ) : (
                <p className="text-sm text-slate-500">
                  Showing <span className="font-semibold text-slate-800">{pageStart + 1}</span> to{' '}
                  <span className="font-semibold text-slate-800">
                    {Math.min(pageStart + ROWS_PER_PAGE, sortedRecords.length)}
                  </span>{' '}
                  of <span className="font-semibold text-slate-800">{sortedRecords.length}</span> records
                  {hasFilters && (
                    <span className="text-slate-400"> (filtered from {records.length})</span>
                  )}
                </p>
              )}
            </div>
            
            {selected.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">
                  {selected.size} selected
                </span>
                <button
                  onClick={() => handleBulkAction('email')}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Email Parents
                </button>
                <button
                  onClick={() => handleBulkAction('sms')}
                  className="px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 rounded-lg hover:bg-green-100 transition-colors"
                >
                  Send SMS
                </button>
                <button
                  onClick={() => setSelected(new Set())}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && <LoadingSkeleton />}

          {/* Empty State */}
          {!isLoading && sortedRecords.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {hasFilters ? 'No matching records' : 'No records found'}
              </h3>
              <p className="text-sm text-slate-400 text-center max-w-sm mb-6">
                {hasFilters
                  ? 'Try adjusting your filters or search terms to find what you\'re looking for.'
                  : 'Start by marking attendance for today or importing records.'}
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Table View */}
          {!isLoading && sortedRecords.length > 0 && viewMode === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="w-10 px-4 py-3">
                      <input
                        ref={indRef}
                        type="checkbox"
                        checked={allPageSelected}
                        onChange={toggleAll}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="w-12 px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      #
                    </th>
                    {[
                      { key: 'studentName', label: 'Student' },
                      { key: 'className', label: 'Class' },
                      { key: 'date', label: 'Date' },
                      { key: 'status', label: 'Status' },
                      { key: 'attendanceRate', label: 'Rate' },
                      { key: 'createdAt', label: 'Recorded' },
                    ].map(col => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key as SortField)}
                        className="group px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 whitespace-nowrap"
                      >
                        <span className="inline-flex items-center">
                          {col.label}
                          <SortChevrons active={sortField === col.key} dir={sortDir} />
                        </span>
                      </th>
                    ))}
                    <th className="w-10 px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageRecords.map((record, idx) => {
                    const student = MOCK_STUDENTS.find(s => s.id === record.studentId);
                    const style = STATUS_STYLE[record.status] ?? STATUS_STYLE.absent;
                    const isChecked = selected.has(record.id);
                    
                    return (
                      <tr
                        key={record.id}
                        className={`group border-l-2 transition-colors ${
                          isChecked
                            ? 'bg-blue-50/60 border-l-blue-400'
                            : `border-l-transparent ${style.rowAccent} hover:bg-slate-50`
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleOne(record.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                          {pageStart + idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              setSelectedStudent(student || null);
                              setShowStudentModal(true);
                            }}
                            className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                          >
                            <Avatar name={record.studentName || ''} id={record.studentId} />
                            <div className="text-left">
                              <div className="text-sm font-medium text-slate-900">
                                {record.studentName}
                              </div>
                              <div className="text-xs text-slate-400">
                                ID: {record.studentId}
                              </div>
                            </div>
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 rounded-md">
                            {record.className}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                          <div>{fmtDate(record.date)}</div>
                          <div className="text-xs text-slate-400">{fmtRelativeTime(record.date)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill status={record.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${
                                  (student?.attendanceRate || 0) >= 90
                                    ? 'from-emerald-500 to-emerald-600'
                                    : (student?.attendanceRate || 0) >= 75
                                    ? 'from-amber-500 to-amber-600'
                                    : 'from-red-500 to-red-600'
                                }`}
                                style={{ width: `${student?.attendanceRate || 0}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-700">
                              {student?.attendanceRate || 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                          {record.createdAt ? (
                            <>
                              <div>{fmtTime(record.createdAt)}</div>
                              <div className="text-slate-300">ID: {record.recordedBy}</div>
                            </>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Card View */}
          {!isLoading && sortedRecords.length > 0 && viewMode === 'cards' && (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pageRecords.map(record => {
                const student = MOCK_STUDENTS.find(s => s.id === record.studentId);
                const style = STATUS_STYLE[record.status] ?? STATUS_STYLE.absent;
                const isChecked = selected.has(record.id);
                
                return (
                  <div
                    key={record.id}
                    className={`relative rounded-xl border p-5 cursor-pointer transition-all duration-200 ${
                      isChecked
                        ? 'border-blue-400 bg-blue-50/60 ring-2 ring-blue-200'
                        : `bg-white ${style.cardBorder} hover:shadow-lg hover:-translate-y-0.5`
                    }`}
                    onClick={() => toggleOne(record.id)}
                  >
                    <div className="absolute top-3 right-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => e.stopPropagation()}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-start gap-3 mb-4">
                      <Avatar name={record.studentName || ''} id={record.studentId} size="lg" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 truncate">
                          {record.studentName}
                        </h3>
                        <p className="text-xs text-slate-500">{record.className}</p>
                        <p className="text-xs text-slate-400 mt-1">ID: {record.studentId}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <StatusPill status={record.status} size="sm" />
                      <span className="text-xs text-slate-400">
                        {fmtRelativeTime(record.date)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {/* Attendance Rate Bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-500">Attendance Rate</span>
                          <span className="font-medium text-slate-700">{student?.attendanceRate || 0}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${
                              (student?.attendanceRate || 0) >= 90
                                ? 'from-emerald-500 to-emerald-600'
                                : (student?.attendanceRate || 0) >= 75
                                ? 'from-amber-500 to-amber-600'
                                : 'from-red-500 to-red-600'
                            }`}
                            style={{ width: `${student?.attendanceRate || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Parent Contact */}
                      {student && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="truncate">{student.parentPhone}</span>
                        </div>
                      )}
                    </div>

                    {record.remarks && (
                      <div className="mt-3 p-2 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                        <span className="font-medium">Note:</span> {record.remarks}
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        {record.createdAt ? fmtTime(record.createdAt) : '—'}
                      </span>
                      <span className="text-slate-400">by {record.recordedBy || 'System'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Calendar View Placeholder */}
          {!isLoading && sortedRecords.length > 0 && viewMode === 'calendar' && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Calendar View Coming Soon</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                We're working on an interactive calendar view to help you visualize attendance patterns over time.
              </p>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2">
                <select
                  value={ROWS_PER_PAGE}
                  className="h-8 px-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="10">10 rows</option>
                  <option value="25">25 rows</option>
                  <option value="50">50 rows</option>
                  <option value="100">100 rows</option>
                </select>
                <span className="text-sm text-slate-400">
                  Page {safePage} of {totalPages}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={safePage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={safePage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {pageNumbers.map((page, i) => (
                  page === '…' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-sm text-slate-400">…</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-all ${
                        safePage === page
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={safePage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safePage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Details Modal */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setShowStudentModal(false)} />
            
            <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl transform transition-all">
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar name={selectedStudent.name} id={selectedStudent.id} size="lg" />
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedStudent.name}</h2>
                    <p className="text-sm text-slate-500">{selectedStudent.className}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">Student ID</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedStudent.id}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">Email</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedStudent.email}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">Parent/Guardian</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedStudent.parentName}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">Parent Contact</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedStudent.parentPhone}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Attendance Summary</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-600">Overall Attendance Rate</span>
                        <span className="font-semibold text-slate-900">{selectedStudent.attendanceRate}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${
                            selectedStudent.attendanceRate >= 90
                              ? 'from-emerald-500 to-emerald-600'
                              : selectedStudent.attendanceRate >= 75
                              ? 'from-amber-500 to-amber-600'
                              : 'from-red-500 to-red-600'
                          }`}
                          style={{ width: `${selectedStudent.attendanceRate}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-emerald-50 rounded-lg">
                        <p className="text-xs text-emerald-600 mb-1">Present Days</p>
                        <p className="text-lg font-bold text-emerald-700">{selectedStudent.presentDays}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-600 mb-1">Total Days</p>
                        <p className="text-lg font-bold text-slate-700">{selectedStudent.totalDays}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    View Full History
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors">
                    Contact Parent
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl animate-slide-up ${
          toast.type === 'success' ? 'bg-emerald-600' :
          toast.type === 'error' ? 'bg-red-600' :
          'bg-blue-600'
        } text-white`}>
          <div className="flex-shrink-0">
            {toast.type === 'success' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.type === 'error' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {toast.type === 'info' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <p className="text-sm font-medium">{toast.msg}</p>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}