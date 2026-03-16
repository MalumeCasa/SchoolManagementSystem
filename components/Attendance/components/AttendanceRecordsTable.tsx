'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getAttendanceRecords } from '@api/actions';
import { AttendanceStatusBadge } from './AttendanceStatusBadge';

// ── Types (exported so the page can import them) ──────────────────────────────
export type StatusFilter = '' | 'present' | 'absent' | 'late' | 'half-day';

export interface AttendanceRecord {
  id: number;
  studentId: number;
  classId: number;
  date: string;
  status: string;
  subjectId?: number | null;
  remarks?: string | null;
  recordedBy?: number | null;
  createdAt: string | null;
  studentName?: string;
  className?: string | null;
}

export interface AttendanceRecordsTableProps {
  /** Re-fetches from API when changed */
  classId?: number;
  date?: string;
  /** Applied in-memory – no re-fetch needed */
  searchQuery?: string;
  statusFilter?: StatusFilter;
  /** Fires whenever the filtered result count changes (useful for parent summary strip) */
  onFilteredCountChange?: (count: number) => void;
}

type SortField = 'studentName' | 'className' | 'date' | 'status' | 'createdAt';
type SortDir   = 'asc' | 'desc';

// ── Mock data (remove once API is ready) ─────────────────────────────────────
const MOCK_RECORDS: AttendanceRecord[] = [
  { id: 1,  studentId: 1,  classId: 1, studentName: 'Amara Osei',      className: 'Grade 8A',  date: '2024-11-15', status: 'present',  remarks: '',                   createdAt: '2024-11-15T08:31:00Z' },
  { id: 2,  studentId: 2,  classId: 1, studentName: 'Liam Patel',       className: 'Grade 8A',  date: '2024-11-15', status: 'absent',   remarks: 'Sick leave',         createdAt: '2024-11-15T08:31:00Z' },
  { id: 3,  studentId: 3,  classId: 1, studentName: 'Zara Mokoena',     className: 'Grade 8A',  date: '2024-11-15', status: 'late',     remarks: 'Traffic',            createdAt: '2024-11-15T09:18:00Z' },
  { id: 4,  studentId: 4,  classId: 2, studentName: 'Ethan Nkosi',      className: 'Grade 8B',  date: '2024-11-15', status: 'present',  remarks: '',                   createdAt: '2024-11-15T08:30:00Z' },
  { id: 5,  studentId: 5,  classId: 2, studentName: 'Sofia Dlamini',    className: 'Grade 8B',  date: '2024-11-15', status: 'half-day', remarks: 'Doctor appointment', createdAt: '2024-11-15T08:30:00Z' },
  { id: 6,  studentId: 6,  classId: 3, studentName: 'Kwame Boateng',    className: 'Grade 9A',  date: '2024-11-15', status: 'present',  remarks: '',                   createdAt: '2024-11-15T08:32:00Z' },
  { id: 7,  studentId: 7,  classId: 3, studentName: 'Isla Ferreira',    className: 'Grade 9A',  date: '2024-11-15', status: 'absent',   remarks: 'Family emergency',   createdAt: '2024-11-15T08:32:00Z' },
  { id: 8,  studentId: 8,  classId: 3, studentName: 'Jayden Sithole',   className: 'Grade 9A',  date: '2024-11-15', status: 'present',  remarks: '',                   createdAt: '2024-11-15T08:32:00Z' },
  { id: 9,  studentId: 9,  classId: 4, studentName: 'Nadia Fourie',     className: 'Grade 9B',  date: '2024-11-15', status: 'late',     remarks: 'Bus delay',          createdAt: '2024-11-15T09:05:00Z' },
  { id: 10, studentId: 10, classId: 4, studentName: 'Omar Hendricks',   className: 'Grade 9B',  date: '2024-11-15', status: 'present',  remarks: '',                   createdAt: '2024-11-15T08:30:00Z' },
  { id: 11, studentId: 11, classId: 5, studentName: 'Priya Ramsamy',    className: 'Grade 10A', date: '2024-11-15', status: 'present',  remarks: '',                   createdAt: '2024-11-15T08:29:00Z' },
  { id: 12, studentId: 12, classId: 5, studentName: 'Caleb Joubert',    className: 'Grade 10A', date: '2024-11-15', status: 'absent',   remarks: '',                   createdAt: '2024-11-15T08:29:00Z' },
  { id: 13, studentId: 13, classId: 5, studentName: 'Leila Mahlangu',   className: 'Grade 10A', date: '2024-11-15', status: 'present',  remarks: '',                   createdAt: '2024-11-15T08:29:00Z' },
  { id: 14, studentId: 14, classId: 1, studentName: 'Noah van Wyk',     className: 'Grade 8A',  date: '2024-11-15', status: 'late',     remarks: 'Overslept',          createdAt: '2024-11-15T09:22:00Z' },
  { id: 15, studentId: 15, classId: 2, studentName: 'Tumi Khumalo',     className: 'Grade 8B',  date: '2024-11-15', status: 'present',  remarks: '',                   createdAt: '2024-11-15T08:30:00Z' },
  { id: 16, studentId: 16, classId: 4, studentName: 'Aisha Petersen',   className: 'Grade 9B',  date: '2024-11-15', status: 'half-day', remarks: 'Early pickup',       createdAt: '2024-11-15T08:31:00Z' },
  { id: 17, studentId: 17, classId: 3, studentName: 'Marcus Swanepoel', className: 'Grade 9A',  date: '2024-11-15', status: 'present',  remarks: '',                   createdAt: '2024-11-15T08:32:00Z' },
  { id: 18, studentId: 18, classId: 2, studentName: 'Yemi Adeyemi',     className: 'Grade 8B',  date: '2024-11-15', status: 'absent',   remarks: 'No reason given',    createdAt: '2024-11-15T08:30:00Z' },
  { id: 19, studentId: 19, classId: 1, studentName: 'Cara du Plessis',  className: 'Grade 8A',  date: '2024-11-15', status: 'present',  remarks: '',                   createdAt: '2024-11-15T08:31:00Z' },
  { id: 20, studentId: 20, classId: 5, studentName: 'Sipho Zulu',       className: 'Grade 10A', date: '2024-11-15', status: 'present',  remarks: '',                   createdAt: '2024-11-15T08:29:00Z' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const isValidStatus = (s: string): s is 'present' | 'absent' | 'late' | 'half-day' =>
  ['present', 'absent', 'late', 'half-day'].includes(s);

const formatDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });

const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });

const STATUS_CFG: Record<string, { dot: string; rowBg: string }> = {
  present:    { dot: 'bg-emerald-500', rowBg: '' },
  absent:     { dot: 'bg-red-500',     rowBg: 'bg-red-50/50' },
  late:       { dot: 'bg-amber-500',   rowBg: 'bg-amber-50/50' },
  'half-day': { dot: 'bg-violet-500',  rowBg: 'bg-violet-50/40' },
};

const AV_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
];

const initials = (name: string) =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

// ── Sub-components ────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      {[10, 8, 36, 24, 20, 16, 28, 16, 8].map((w, i) => (
        <td key={i} className="px-3 py-3.5">
          <div className="h-3 bg-slate-100 rounded-full animate-pulse" style={{ width: `${w * 4}px` }} />
        </td>
      ))}
    </tr>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={`inline-flex flex-col gap-px ml-1 ${active ? 'opacity-100' : 'opacity-25 group-hover:opacity-50'} transition-opacity`}>
      <svg className={`w-2 h-2 ${active && dir === 'asc' ? 'text-blue-600' : 'text-slate-400'}`} fill="currentColor" viewBox="0 0 8 5">
        <path d="M4 0L8 5H0z" />
      </svg>
      <svg className={`w-2 h-2 ${active && dir === 'desc' ? 'text-blue-600' : 'text-slate-400'}`} fill="currentColor" viewBox="0 0 8 5">
        <path d="M4 5L0 0h8z" />
      </svg>
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function AttendanceRecordsTable({
  classId,
  date,
  searchQuery = '',
  statusFilter = '',
  onFilteredCountChange,
}: AttendanceRecordsTableProps) {
  const [rawRecords,  setRawRecords]  = useState<AttendanceRecord[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField,   setSortField]   = useState<SortField>('date');
  const [sortDir,     setSortDir]     = useState<SortDir>('desc');
  const [selected,    setSelected]    = useState<Set<number>>(new Set());
  const recordsPerPage = 10;

  // ── Fetch: only re-runs when API-level filters change ────────────────────
  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    setSelected(new Set());
    try {
      const filters: Record<string, unknown> = {};
      if (classId) filters.classId = classId;
      if (date)    filters.date    = date;
      const result = await getAttendanceRecords(filters);
      setRawRecords(result.success && result.data ? result.data : []);
    } catch {
      setRawRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [classId, date]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  // Use real data when available, otherwise fall back to mock
  const baseRecords = rawRecords.length > 0 ? rawRecords : MOCK_RECORDS;

  // ── Client-side filtering (search + status) – NO re-fetch ───────────────
  const filtered = useMemo(() => {
    let result = baseRecords;

    if (statusFilter) {
      result = result.filter(r => r.status === statusFilter);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(r =>
        (r.studentName ?? '').toLowerCase().includes(q) ||
        (r.className   ?? '').toLowerCase().includes(q) ||
        String(r.studentId).includes(q)
      );
    }

    return result;
  }, [baseRecords, statusFilter, searchQuery]);

  // Tell parent the current filtered count
  useEffect(() => {
    onFilteredCountChange?.(filtered.length);
  }, [filtered.length, onFilteredCountChange]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelected(new Set());
  }, [statusFilter, searchQuery]);

  // ── Sorting ──────────────────────────────────────────────────────────────
  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = String((a as unknown as Record<string, unknown>)[sortField] ?? '').toLowerCase();
      const bv = String((b as unknown as Record<string, unknown>)[sortField] ?? '').toLowerCase();
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  // ── Pagination ───────────────────────────────────────────────────────────
  const totalPages   = Math.max(1, Math.ceil(sorted.length / recordsPerPage));
  const safePage     = Math.min(currentPage, totalPages);
  const pageStart    = (safePage - 1) * recordsPerPage;
  const currentSlice = sorted.slice(pageStart, pageStart + recordsPerPage);

  // ── Selection ────────────────────────────────────────────────────────────
  const pageIds         = currentSlice.map(r => r.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every(id => selected.has(id));
  const someSelected    = pageIds.some(id => selected.has(id)) && !allPageSelected;
  const indeterminateRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (indeterminateRef.current) indeterminateRef.current.indeterminate = someSelected;
  }, [someSelected]);

  const toggleSelectAll = () => {
    setSelected(prev => {
      const next = new Set(prev);
      allPageSelected ? pageIds.forEach(id => next.delete(id)) : pageIds.forEach(id => next.add(id));
      return next;
    });
  };
  const toggleOne = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Page number list ─────────────────────────────────────────────────────
  const pageNumbers: (number | '…')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1);
    if (safePage > 3) pageNumbers.push('…');
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++)
      pageNumbers.push(i);
    if (safePage < totalPages - 2) pageNumbers.push('…');
    pageNumbers.push(totalPages);
  }

  const cols: { label: string; field?: SortField; className?: string }[] = [
    { label: 'Student',  field: 'studentName' },
    { label: 'Class',    field: 'className'   },
    { label: 'Date',     field: 'date'        },
    { label: 'Status',   field: 'status'      },
    { label: 'Remarks'                        },
    { label: 'Recorded', field: 'createdAt',  className: 'hidden lg:table-cell' },
  ];

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-44 bg-slate-100 rounded-full animate-pulse" />
          <div className="h-7 w-20 bg-slate-100 rounded-lg animate-pulse" />
        </div>
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {Array.from({ length: 9 }).map((_, i) => (
                  <th key={i} className="px-3 py-3">
                    <div className="h-3 w-14 bg-slate-200 rounded-full animate-pulse" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}</tbody>
          </table>
        </div>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────
  if (filtered.length === 0) {
    const hasFilters = !!(statusFilter || searchQuery.trim());
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d={hasFilters
                ? 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z'
                : 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'} />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">
          {hasFilters ? 'No matching records' : 'No records found'}
        </h3>
        <p className="text-xs text-slate-400 mb-4 max-w-xs">
          {hasFilters
            ? 'Try adjusting your search term or status filter.'
            : 'No attendance records have been submitted for this selection.'}
        </p>
        <button
          onClick={fetchRecords}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
    );
  }

  // ── Table ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <p className="text-xs text-slate-500">
            Showing{' '}
            <span className="font-semibold text-slate-800">
              {pageStart + 1}–{Math.min(pageStart + recordsPerPage, sorted.length)}
            </span>
            {' '}of{' '}
            <span className="font-semibold text-slate-800">{sorted.length}</span>
            {' '}records
            {(statusFilter || searchQuery) && (
              <span className="text-slate-400"> (filtered)</span>
            )}
          </p>
          {selected.size > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
              {selected.size} selected
              <button
                onClick={() => setSelected(new Set())}
                className="ml-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
              >
                <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-100 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete {selected.size}
            </button>
          )}
          <button
            onClick={fetchRecords}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50">
                <th className="pl-4 pr-2 py-3 w-10">
                  <input
                    ref={indeterminateRef}
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                  />
                </th>
                <th className="px-2 py-3 w-10 text-xs font-semibold text-slate-400 text-right">#</th>

                {cols.map(({ label, field, className }) => (
                  <th
                    key={label}
                    onClick={field ? () => handleSort(field) : undefined}
                    className={`
                      group px-4 py-3 text-left text-xs font-semibold text-slate-500
                      uppercase tracking-wide whitespace-nowrap select-none
                      ${field ? 'cursor-pointer hover:text-slate-800 hover:bg-slate-100 transition-colors' : ''}
                      ${className ?? ''}
                    `}
                  >
                    <span className="inline-flex items-center gap-0.5">
                      {label}
                      {field && <SortIcon active={sortField === field} dir={sortDir} />}
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-slate-100">
              {currentSlice.map((record, idx) => {
                const cfg       = STATUS_CFG[record.status] ?? STATUS_CFG.absent;
                const avColor   = AV_COLORS[record.studentId % AV_COLORS.length];
                const isChecked = selected.has(record.id);
                const name      = record.studentName ?? `Student ${record.studentId}`;

                return (
                  <tr
                    key={record.id}
                    className={`group transition-colors ${
                      isChecked
                        ? 'bg-blue-50/70 hover:bg-blue-50'
                        : `${cfg.rowBg} hover:bg-slate-50/80`
                    }`}
                  >
                    <td className="pl-4 pr-2 py-3.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleOne(record.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                      />
                    </td>

                    <td className="px-2 py-3.5 text-xs text-slate-300 text-right font-mono tabular-nums">
                      {pageStart + idx + 1}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avColor}`}>
                          {initials(name)}
                        </div>
                        <span className="text-sm font-medium text-slate-900">{name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-md">
                        {record.className ?? `Class ${record.classId}`}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap text-sm text-slate-600 tabular-nums">
                      {formatDate(record.date)}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                        <AttendanceStatusBadge
                          status={isValidStatus(record.status) ? record.status : 'absent'}
                          size="sm"
                        />
                      </div>
                    </td>

                    <td className="px-4 py-3.5 max-w-[160px]">
                      {record.remarks
                        ? <span className="text-sm text-slate-600 truncate block" title={record.remarks}>{record.remarks}</span>
                        : <span className="text-xs text-slate-300">—</span>}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap hidden lg:table-cell">
                      <span className="text-xs text-slate-400 font-mono tabular-nums">
                        {record.createdAt ? formatTime(record.createdAt) : '—'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <button className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
          <p className="text-xs text-slate-400 hidden sm:block">
            Page <span className="font-semibold text-slate-600">{safePage}</span> of{' '}
            <span className="font-semibold text-slate-600">{totalPages}</span>
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {pageNumbers.map((n, i) =>
              n === '…' ? (
                <span key={`ell-${i}`} className="px-1 text-xs text-slate-400 select-none">…</span>
              ) : (
                <button
                  key={n}
                  onClick={() => setCurrentPage(n)}
                  className={`min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-semibold transition-all ${
                    safePage === n
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                      : 'text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200'
                  }`}
                >
                  {n}
                </button>
              )
            )}

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Rows</span>
            <select className="h-7 text-xs border border-slate-200 rounded-lg px-1.5 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}