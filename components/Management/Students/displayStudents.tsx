"use client";

import React, { useEffect, useCallback, useRef, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  deleteStudent,
  exportStudents,
  updateStudentFromDisplay
} from "@api/student-actions";
import {
  Download,
  FileText,
  Table as TableIcon,
  Braces,
  Edit3,
  Eye,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Users,
  CheckCircle2,
  Search,
  Filter,
  X,
  GraduationCap,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Save,
  XCircle,
  AlertTriangle,
  CheckCheck,
  RefreshCw,
  Printer,
  DownloadCloud,
  UserPlus,
  MoreVertical,
  Check,
  Clock,
  AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Student {
  id: string;
  studentId: string | null;
  name: string;
  surname: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  year?: number | null;
  class: string | null;
  className: string | null;
  status: string | null;
  registeredStudentId: number | null;
  classId: number | null;
  attendance: string | null;
  dateOfBirth?: Date | string | null;
  gender?: string | null;
  enrollmentDate?: Date | string | null;
  idNumber?: string | null;
  classSection?: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

type SortField = keyof Student | null;
type SortDir = "asc" | "desc";

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
}

// ─── Toast System ─────────────────────────────────────────────────────────────

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border pointer-events-auto
            animate-in slide-in-from-right-8 fade-in duration-300 min-w-[320px] max-w-[400px] backdrop-blur-sm
            ${toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/90 dark:border-emerald-700 dark:text-emerald-200" : ""}
            ${toast.type === "error" ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/90 dark:border-red-700 dark:text-red-200" : ""}
            ${toast.type === "warning" ? "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/90 dark:border-amber-700 dark:text-amber-200" : ""}
            ${toast.type === "info" ? "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/90 dark:border-blue-700 dark:text-blue-200" : ""}
          `}
        >
          {toast.type === "success" && <CheckCircle2 className="w-5 h-5 shrink-0" />}
          {toast.type === "error" && <XCircle className="w-5 h-5 shrink-0" />}
          {toast.type === "warning" && <AlertTriangle className="w-5 h-5 shrink-0" />}
          {toast.type === "info" && <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="opacity-60 hover:opacity-100 transition-opacity rounded-full p-1 hover:bg-black/5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full animate-in zoom-in-95 fade-in duration-200">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${danger ? "bg-red-100 dark:bg-red-900/40" : "bg-blue-100 dark:bg-blue-900/40"
          }`}>
          {danger ? (
            <AlertTriangle className={`w-7 h-7 text-red-600 dark:text-red-400`} />
          ) : (
            <AlertCircle className={`w-7 h-7 text-blue-600 dark:text-blue-400`} />
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
          {title}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
          {message}
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-11 text-base"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            className={`flex-1 h-11 text-base ${danger
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Student Avatar ───────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  { from: "from-blue-500", to: "to-blue-600", bg: "bg-blue-100", text: "text-blue-600" },
  { from: "from-violet-500", to: "to-violet-600", bg: "bg-violet-100", text: "text-violet-600" },
  { from: "from-emerald-500", to: "to-emerald-600", bg: "bg-emerald-100", text: "text-emerald-600" },
  { from: "from-rose-500", to: "to-rose-600", bg: "bg-rose-100", text: "text-rose-600" },
  { from: "from-amber-500", to: "to-amber-600", bg: "bg-amber-100", text: "text-amber-600" },
  { from: "from-cyan-500", to: "to-cyan-600", bg: "bg-cyan-100", text: "text-cyan-600" },
  { from: "from-fuchsia-500", to: "to-fuchsia-600", bg: "bg-fuchsia-100", text: "text-fuchsia-600" },
  { from: "from-lime-500", to: "to-lime-600", bg: "bg-lime-100", text: "text-lime-600" },
];

function StudentAvatar({ name, surname }: { name: string; surname: string }) {
  const initials = `${name?.[0] ?? ""}${surname?.[0] ?? ""}`.toUpperCase();
  const idx = (name.charCodeAt(0) + (surname.charCodeAt(0) || 0)) % AVATAR_COLORS.length;
  const color = AVATAR_COLORS[idx];

  return (
    <div className={`relative`}>
      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color.from} ${color.to} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
        {initials}
      </div>
      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-gray-800" />
    </div>
  );
}

// ─── Inline Edit Cell ─────────────────────────────────────────────────────────

function InlineEditCell({
  value,
  field,
  studentId,
  onSave,
  type = "text",
}: {
  value: string | null | undefined;
  field: string;
  studentId: string;
  onSave: (id: string, field: string, value: string) => Promise<void>;
  type?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const handleSave = async () => {
    if (draft === (value ?? "")) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(studentId, field, draft);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setDraft(value ?? "");
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1 min-w-0">
        <input
          ref={inputRef}
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={saving}
          className="w-full min-w-0 px-2.5 py-1.5 text-sm border-2 border-primary rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg shrink-0 transition-colors"
        >
          <Save className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setDraft(value ?? ""); setEditing(false); }}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg shrink-0 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="group flex items-center gap-1.5 text-left hover:text-primary transition-colors w-full min-w-0"
      title="Click to edit"
    >
      <span className="truncate text-sm">
        {value || <span className="text-gray-400 italic text-xs">Not set</span>}
      </span>
      <Edit3 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 shrink-0 transition-opacity" />
    </button>
  );
}

// ─── Sort Header ──────────────────────────────────────────────────────────────

function SortableHeader({
  field,
  label,
  sortField,
  sortDir,
  onSort,
  className = "",
}: {
  field: SortField;
  label: string;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
  className?: string;
}) {
  const active = sortField === field;

  return (
    <TableHead
      className={`font-semibold text-gray-900 dark:text-white py-4 px-4 whitespace-nowrap cursor-pointer select-none group hover:text-primary transition-colors ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1.5">
        <span>{label}</span>
        <span className={`transition-all duration-200 ${active
          ? "text-primary opacity-100"
          : "text-gray-400 opacity-0 group-hover:opacity-40"
          }`}>
          {!active && <ArrowUpDown className="w-3.5 h-3.5" />}
          {active && sortDir === "asc" && <ArrowUp className="w-3.5 h-3.5" />}
          {active && sortDir === "desc" && <ArrowDown className="w-3.5 h-3.5" />}
        </span>
      </div>
    </TableHead>
  );
}

// ─── Export Buttons ───────────────────────────────────────────────────────────

function ExportButtons({ students, selectedStudents = [] }: { students: Student[]; selectedStudents?: string[] }) {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const hasSelected = selectedStudents.length > 0;
  const dataToExport = hasSelected ? students.filter((s) => selectedStudents.includes(s.id)) : students;

  const handleExport = async (format: "json" | "csv" | "xlsx") => {
    setIsExporting(format);
    try {
      const result = await exportStudents(dataToExport, format);
      if (result) {
        const blob = new Blob([result.data], { type: result.mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(null);
    }
  };

  const options = [
    { format: "json" as const, label: "JSON", icon: Braces, color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-50 dark:bg-purple-950/50" },
    { format: "csv" as const, label: "CSV", icon: FileText, color: "text-green-600 dark:text-green-400", bgColor: "bg-green-50 dark:bg-green-950/50" },
    { format: "xlsx" as const, label: "Excel", icon: TableIcon, color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-50 dark:bg-emerald-950/50" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mr-1">
        {hasSelected ? `Export ${selectedStudents.length} selected` : "Export all"}
      </span>
      {options.map(({ format, label, icon: Icon, color, bgColor }) => (
        <Button
          key={format}
          onClick={() => handleExport(format)}
          disabled={isExporting !== null}
          variant="outline"
          size="sm"
          className={`h-9 gap-2 border-gray-200 dark:border-gray-700 hover:${bgColor} transition-all hover:scale-105 disabled:opacity-50`}
        >
          {isExporting === format ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Icon className={`w-3.5 h-3.5 ${color}`} />
          )}
          <span>{label}</span>
        </Button>
      ))}
    </div>
  );
}

// ─── Custom Hooks ─────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

function useStudentFilters(students: Student[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClass, setFilterClass] = useState("all");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const toggleSort = useCallback((field: SortField) => {
    if (field) {
      setSortField((prev) => {
        if (prev === field) {
          setSortDir((d) => (d === "asc" ? "desc" : "asc"));
          return field;
        }
        setSortDir("asc");
        return field;
      });
    }
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setFilterYear("all");
    setFilterStatus("all");
    setFilterClass("all");
  }, []);

  const hasFilters = debouncedSearch || filterYear !== "all" || filterStatus !== "all" || filterClass !== "all";

  const filtered = React.useMemo(() => {
    let result = students.filter((s) => {
      const query = debouncedSearch.toLowerCase().trim();

      const searchMatch = !query || [
        s.name,
        s.surname,
        `${s.name} ${s.surname}`,
        s.email,
        s.studentId,
        s.phone,
        s.address,
        s.class,
        s.className,
      ].some((field) => field?.toLowerCase().includes(query));

      const yearMatch = filterYear === "all" || s.year?.toString() === filterYear;
      const statusMatch = filterStatus === "all" || s.status?.toLowerCase() === filterStatus.toLowerCase();
      const classMatch = filterClass === "all" || s.class === filterClass || s.className === filterClass;

      return searchMatch && yearMatch && statusMatch && classMatch;
    });

    if (sortField) {
      result = [...result].sort((a, b) => {
        const aVal = String(a[sortField] ?? "").toLowerCase();
        const bVal = String(b[sortField] ?? "").toLowerCase();
        const comparison = aVal.localeCompare(bVal);
        return sortDir === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [students, debouncedSearch, filterYear, filterStatus, filterClass, sortField, sortDir]);

  const years = React.useMemo(() =>
    [...new Set(students.map((s) => s.year).filter((y): y is number => y !== null && y !== undefined))].sort(),
    [students]
  );

  const statuses = React.useMemo(() =>
    [...new Set(students.map((s) => s.status).filter((s): s is string => Boolean(s)))],
    [students]
  );

  // FIXED: Filter out null values and ensure we only have strings
  const classes = React.useMemo(() =>
    [...new Set(
      students
        .map((s) => s.class || s.className)
        .filter((cls): cls is string => cls !== null && cls !== undefined && cls !== '')
    )].sort(),
    [students]
  );

  return {
    searchTerm, setSearchTerm,
    filterYear, setFilterYear,
    filterStatus, setFilterStatus,
    filterClass, setFilterClass,
    sortField, sortDir, toggleSort,
    clearFilters, hasFilters,
    filtered, years, statuses, classes,
  };
}

// ─── Badge Helpers ────────────────────────────────────────────────────────────

const getStatusBadge = (status?: string | null) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800";
    case "inactive":
      return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600";
    case "suspended":
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800";
    case "graduated":
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800";
    case "pending":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600";
  }
};

const YEAR_COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
  "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400",
  "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400",
];

const getYearBadge = (year?: number | null) => {
  if (!year) return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
  return YEAR_COLORS[(year - 1) % YEAR_COLORS.length];
};

const CLASS_COLORS = [
  "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm",
  "bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-sm",
  "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm",
  "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm",
  "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-sm",
  "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-sm",
  "bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 text-white shadow-sm",
  "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-sm",
];

const getClassBadge = (className?: string | null) => {
  if (!className) return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  const hash = className.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return CLASS_COLORS[hash % CLASS_COLORS.length];
};

const getClassIcon = (className?: string | null) => {
  if (!className) return <BookOpen className="w-3 h-3" />;

  const lower = className.toLowerCase();
  if (lower.includes("science") || lower.includes("physics") || lower.includes("chemistry") || lower.includes("biology")) {
    return <GraduationCap className="w-3 h-3" />;
  }
  if (lower.includes("math")) {
    return <BookOpen className="w-3 h-3" />;
  }
  return <BookOpen className="w-3 h-3" />;
};

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  currentPage,
  totalPages,
  totalFiltered,
  itemsPerPage,
  itemsPerPageOptions,
  onPageChange,
  onItemsPerPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalFiltered: number;
  itemsPerPage: number;
  itemsPerPageOptions: number[];
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (size: number) => void;
}) {
  if (totalPages <= 1 && totalFiltered <= itemsPerPage) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 3) {
      end = Math.min(totalPages - 1, maxVisible - 1);
    }

    if (currentPage >= totalPages - 2) {
      start = Math.max(2, totalPages - (maxVisible - 2));
    }

    if (start > 2) {
      pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push("...");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalFiltered);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-medium text-gray-900 dark:text-white">{start}</span>
          {" - "}
          <span className="font-medium text-gray-900 dark:text-white">{end}</span>
          {" of "}
          <span className="font-medium text-gray-900 dark:text-white">{totalFiltered}</span>
        </p>

        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {itemsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option} per page
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-9 w-9 p-0 hidden sm:flex"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 w-9 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className="px-2 text-gray-400">...</span>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={`h-9 w-9 p-0 ${currentPage === page
                  ? "bg-primary hover:bg-primary/90 text-white border-0"
                  : ""
                  }`}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 p-0 hidden sm:flex"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Bulk Action Bar ──────────────────────────────────────────────────────────

function BulkActionBar({
  selectedCount,
  onBulkDelete,
  onBulkExport,
  onClearSelection,
  isDeleting,
}: {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkExport: (format: "json" | "csv" | "xlsx") => void;
  onClearSelection: () => void;
  isDeleting: boolean;
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="max-w-screen-2xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-semibold">
              {selectedCount}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedCount} student{selectedCount !== 1 ? 's' : ''} selected
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click to perform bulk actions
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-1">
              Export as:
            </span>
            {(["json", "csv", "xlsx"] as const).map((format) => (
              <Button
                key={format}
                variant="outline"
                size="sm"
                onClick={() => onBulkExport(format)}
                className="h-9 gap-1.5 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {format.toUpperCase()}
              </Button>
            ))}

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />

            <Button
              variant="destructive"
              size="sm"
              onClick={onBulkDelete}
              disabled={isDeleting}
              className="h-9 gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Deleting..." : `Delete ${selectedCount}`}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-9 w-9 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DisplayStudentsPage({ students: initialStudents }: { students: Student[] }) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void } | null>(null);

  const { toasts, addToast, removeToast } = useToast();

  const {
    searchTerm, setSearchTerm,
    filterYear, setFilterYear,
    filterStatus, setFilterStatus,
    filterClass, setFilterClass,
    sortField, sortDir, toggleSort,
    clearFilters, hasFilters,
    filtered, years, statuses, classes,
  } = useStudentFilters(students);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterYear, filterStatus, filterClass, itemsPerPage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to clear search
      if (e.key === "Escape" && searchTerm) {
        setSearchTerm("");
      }
      // Ctrl/Cmd + A to select all
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        if (filtered.length > 0) {
          setSelectedStudents(filtered.map(s => s.id));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchTerm, filtered, setSearchTerm]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelect = (id: string) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === filtered.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filtered.map(s => s.id));
    }
  };

  const allSelected = filtered.length > 0 && selectedStudents.length === filtered.length;
  const partialSelected = selectedStudents.length > 0 && !allSelected;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate refresh - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      addToast("success", "Data refreshed successfully");
    } catch {
      addToast("error", "Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleInlineSave = async (id: string, field: string, value: string) => {
    try {
      // Create update object
      const updateData: any = {};
      updateData[field] = value;

      // Call the server action
      const result = await updateStudentFromDisplay(id, updateData);

      if (result.success) {
        // Update local state
        setStudents(prev => prev.map(s =>
          s.id === id ? { ...s, [field]: value } : s
        ));
        addToast("success", `${field} updated successfully`);
      } else {
        addToast("error", result.error || "Failed to update");
      }
    } catch (error) {
      console.error("Error updating student:", error);
      addToast("error", "Failed to save changes");
    }
  };

  const handleDeleteStudent = (student: Student) => {
    setConfirmDialog({
      open: true,
      title: "Delete Student",
      message: `Are you sure you want to delete ${student.name} ${student.surname}? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmDialog(null);
        setDeletingId(student.id);
        try {
          const result = await deleteStudent(parseInt(student.id));
          if (result.success) {
            setStudents(prev => prev.filter(s => s.id !== student.id));
            setSelectedStudents(prev => prev.filter(id => id !== student.id));
            addToast("success", `${student.name} ${student.surname} deleted successfully`);
          } else {
            addToast("error", `Failed to delete: ${result.error}`);
          }
        } catch {
          addToast("error", "An error occurred while deleting");
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const handleBulkDelete = () => {
    setConfirmDialog({
      open: true,
      title: "Delete Selected Students",
      message: `Are you sure you want to delete ${selectedStudents.length} students? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmDialog(null);
        setBulkDeleting(true);

        try {
          const results = await Promise.allSettled(
            selectedStudents.map(id => deleteStudent(parseInt(id)))
          );

          const successful = results.filter(r => r.status === "fulfilled").length;
          const failed = results.filter(r => r.status === "rejected").length;

          setStudents(prev => prev.filter(s => !selectedStudents.includes(s.id)));
          setSelectedStudents([]);

          if (failed === 0) {
            addToast("success", `Successfully deleted ${successful} students`);
          } else {
            addToast("warning", `Deleted ${successful} students, ${failed} failed`);
          }
        } catch {
          addToast("error", "An error occurred during bulk delete");
        } finally {
          setBulkDeleting(false);
        }
      },
    });
  };

  const handleBulkExport = async (format: "json" | "csv" | "xlsx") => {
    const dataToExport = students.filter(s => selectedStudents.includes(s.id));

    try {
      const result = await exportStudents(dataToExport, format);
      if (result) {
        const blob = new Blob([result.data], { type: result.mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addToast("success", `Exported ${dataToExport.length} students as ${format.toUpperCase()}`);
      }
    } catch {
      addToast("error", "Export failed");
    }
  };

  const hasBottomBar = selectedStudents.length > 0;

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <ConfirmDialog
        open={confirmDialog?.open ?? false}
        title={confirmDialog?.title ?? ""}
        message={confirmDialog?.message ?? ""}
        onConfirm={confirmDialog?.onConfirm ?? (() => { })}
        onCancel={() => setConfirmDialog(null)}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
      />

      <BulkActionBar
        selectedCount={selectedStudents.length}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
        onClearSelection={() => setSelectedStudents([])}
        isDeleting={bulkDeleting}
      />

      <div className={`p-4 sm:p-6 transition-all ${hasBottomBar ? "pb-28" : ""}`}>
        {/* Header with Actions */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Student Directory
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filtered.length} of {students.length} students
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`gap-2 transition-all ${showFilters ? 'bg-primary/5 border-primary' : ''}`}
            >
              <Filter className={`h-4 w-4 ${showFilters ? 'text-primary' : ''}`} />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-2 hidden sm:flex"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50/50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">
                  SEARCH
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, ID, class... (ESC to clear)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Year Filter */}
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">
                  YEAR
                </label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Years</option>
                  {years.length > 0 ? (
                    years.map((year) => (
                      <option key={year} value={year}>
                        Year {year}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No years available</option>
                  )}
                </select>
              </div>

              {/* Class Filter */}
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">
                  CLASS
                </label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Classes</option>
                  {classes.length > 0 ? (
                    classes.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No classes available</option>
                  )}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">
                  STATUS
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Statuses</option>
                  {statuses.length > 0 ? (
                    statuses.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No statuses available</option>
                  )}
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {hasFilters && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Active filters:
                </span>

                {searchTerm && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Search: "{searchTerm}"
                    <button onClick={() => setSearchTerm("")} className="hover:bg-primary/20 rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {filterYear !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    Year {filterYear}
                    <button onClick={() => setFilterYear("all")} className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {filterClass !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    {filterClass}
                    <button onClick={() => setFilterClass("all")} className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {filterStatus !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    {filterStatus}
                    <button onClick={() => setFilterStatus("all")} className="hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Export and Selection Bar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ExportButtons students={filtered} selectedStudents={selectedStudents} />

          {selectedStudents.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">
                {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
              </span>
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block">
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-800">
                  <TableRow>
                    <TableHead className="w-12 py-4">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el) {
                            el.indeterminate = partialSelected;
                          }
                        }}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                      />
                    </TableHead>
                    <SortableHeader field="studentId" label="ID" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
                    <SortableHeader field="name" label="Name" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
                    <SortableHeader field="surname" label="Surname" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
                    <SortableHeader field="email" label="Email" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
                    <SortableHeader field="phone" label="Phone" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
                    <SortableHeader field="year" label="Year" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
                    <SortableHeader field="class" label="Class" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
                    <SortableHeader field="status" label="Status" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
                    <TableHead className="text-center py-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length > 0 ? (
                    paginated.map((student, index) => {
                      const isSelected = selectedStudents.includes(student.id);
                      const isDeleting = deletingId === student.id;

                      return (
                        <TableRow
                          key={student.id}
                          className={`transition-colors duration-150 ${isSelected ? 'bg-primary/5' : ''
                            } ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'
                            } hover:bg-primary/5 dark:hover:bg-primary/10 ${isDeleting ? 'opacity-50 pointer-events-none' : ''
                            }`}
                        >
                          <TableCell className="py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(student.id)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                            />
                          </TableCell>

                          <TableCell className="font-mono text-xs text-gray-500 dark:text-gray-400">
                            {student.studentId || `#${student.id}`}
                          </TableCell>

                          <TableCell className="py-3">
                            <div className="flex items-center gap-3">
                              <StudentAvatar name={student.name} surname={student.surname} />
                              <InlineEditCell
                                value={student.name}
                                field="name"
                                studentId={student.id}
                                onSave={handleInlineSave}
                              />
                            </div>
                          </TableCell>

                          <TableCell className="py-3">
                            <InlineEditCell
                              value={student.surname}
                              field="surname"
                              studentId={student.id}
                              onSave={handleInlineSave}
                            />
                          </TableCell>

                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                              <InlineEditCell
                                value={student.email}
                                field="email"
                                studentId={student.id}
                                onSave={handleInlineSave}
                                type="email"
                              />
                            </div>
                          </TableCell>

                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                              <InlineEditCell
                                value={student.phone || ''}
                                field="phone"
                                studentId={student.id}
                                onSave={handleInlineSave}
                                type="tel"
                              />
                            </div>
                          </TableCell>

                          <TableCell className="py-3">
                            {student.year ? (
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getYearBadge(student.year)}`}>
                                Y{student.year}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </TableCell>

                          <TableCell className="py-3">
                            {(student.class || student.className) ? (
                              <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ${getClassBadge(student.class || student.className)}`}>
                                {getClassIcon(student.class || student.className)}
                                {student.class || student.className}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </TableCell>

                          <TableCell className="py-3">
                            {student.status ? (
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(student.status)}`}>
                                {student.status}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </TableCell>

                          <TableCell className="py-3">
                            <div className="flex items-center justify-center gap-1">
                              <Link
                                href={`/students/${student.id}/edit`}
                                className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 transition-colors dark:text-blue-400 dark:hover:bg-blue-900/20"
                                title="Edit student"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Link>
                              <Link
                                href={`/students/registered/${student.id}`}
                                className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 transition-colors dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                                title="View student details"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => handleDeleteStudent(student)}
                                disabled={isDeleting}
                                className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-50"
                                title="Delete student"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-700">
                            <Users className="h-8 w-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">
                              {students.length === 0 ? "No students yet" : "No matching students"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {students.length === 0
                                ? "Get started by registering your first student."
                                : "Try adjusting your search or filters to find what you're looking for."}
                            </p>
                          </div>
                          {hasFilters && (
                            <Button
                              variant="outline"
                              onClick={clearFilters}
                              className="mt-2"
                            >
                              Clear Filters
                            </Button>
                          )}
                          {students.length === 0 && (
                            <Link href="/register/new/student/">
                              <Button className="gap-2 mt-2">
                                <UserPlus className="h-4 w-4" />
                                Register Student
                              </Button>
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalFiltered={filtered.length}
            itemsPerPage={itemsPerPage}
            itemsPerPageOptions={[10, 25, 50, 100]}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(n) => {
              setItemsPerPage(n);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {paginated.length > 0 ? (
            paginated.map((student) => {
              const isSelected = selectedStudents.includes(student.id);
              const isDeleting = deletingId === student.id;

              return (
                <div
                  key={student.id}
                  className={`rounded-xl border p-5 transition-all ${isSelected
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800'
                    } ${isDeleting ? 'opacity-50 pointer-events-none' : ''
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(student.id)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                    />

                    <StudentAvatar name={student.name} surname={student.surname} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {student.name} {student.surname}
                          </p>
                          <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5">
                            {student.studentId || `#${student.id}`}
                          </p>
                        </div>

                        {student.status && (
                          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(student.status)}`}>
                            {student.status}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {student.year && (
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getYearBadge(student.year)}`}>
                            Year {student.year}
                          </span>
                        )}

                        {(student.class || student.className) && (
                          <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ${getClassBadge(student.class || student.className)}`}>
                            {getClassIcon(student.class || student.className)}
                            {student.class || student.className}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{student.email || 'No email'}</span>
                        </div>

                        {student.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span>{student.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4 dark:border-gray-700">
                    <Link
                      href={`/dashboard/users/students/${student.id}/edit`}
                      className="flex-1 rounded-lg bg-blue-50 py-2.5 text-center text-sm font-medium text-blue-600 hover:bg-blue-100 transition-colors dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/dashboard/users/students/${student.id}`}
                      className="flex-1 rounded-lg bg-emerald-50 py-2.5 text-center text-sm font-medium text-emerald-600 hover:bg-emerald-100 transition-colors dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDeleteStudent(student)}
                      disabled={isDeleting}
                      className="flex-1 rounded-lg bg-red-50 py-2.5 text-center text-sm font-medium text-red-600 hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 disabled:opacity-50"
                    >
                      {isDeleting ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-700">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {students.length === 0 ? "No students yet" : "No matching students"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {students.length === 0
                      ? "Get started by registering your first student."
                      : "Try adjusting your search or filters."}
                  </p>
                </div>
                {hasFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
                {students.length === 0 && (
                  <Link href="/register/new/student/">
                    <Button className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Register Student
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalFiltered={filtered.length}
            itemsPerPage={itemsPerPage}
            itemsPerPageOptions={[10, 25, 50]}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(n) => {
              setItemsPerPage(n);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>
    </>
  );
}