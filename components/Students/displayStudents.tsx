"use client";

import React from "react";
import Link from "next/link";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";
import { Button } from "@/components/ui/button";
import { deleteStudent, exportStudents } from "@api/student-action";
import { 
  Download, 
  FileText, 
  Table as TableIcon, 
  Braces,
  Edit3, 
  Eye, 
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  Users,
  CheckCircle2,
  Search,
  Filter,
  X,
  GraduationCap,
  BookOpen
} from "lucide-react";

interface ExportButtonsProps {
  students: any[];
  selectedStudents?: string[];
}

// Client component for export functionality
function ExportButtons({ students, selectedStudents = [] }: ExportButtonsProps) {
  const hasSelected = selectedStudents.length > 0;
  const dataToExport = hasSelected 
    ? students.filter(student => selectedStudents.includes(student.id))
    : students;

  const handleExport = async (format: 'json' | 'csv' | 'xlsx') => {
    try {
      const result = await exportStudents(dataToExport, format);
      
      if (result) {
        const blob = new Blob([result.data], { type: result.mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error(`Export failed:`, error);
      alert('Export failed. Please try again.');
    }
  };

  const exportOptions = [
    { format: 'json' as const, label: 'JSON', icon: Braces, color: 'text-purple-600 dark:text-purple-400' },
    { format: 'csv' as const, label: 'CSV', icon: FileText, color: 'text-green-600 dark:text-green-400' },
    { format: 'xlsx' as const, label: 'Excel', icon: TableIcon, color: 'text-emerald-600 dark:text-emerald-400' },
  ];

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Download className="w-4 h-4" />
        <span>Export Data</span>
        {hasSelected && (
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-medium">
            {selectedStudents.length} selected
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {exportOptions.map(({ format, label, icon: Icon, color }) => (
          <Button
            key={format}
            onClick={() => handleExport(format)}
            variant="outline"
            className="h-12 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Icon className={`w-4 h-4 ${color}`} />
            <span className="font-medium">
              {hasSelected ? `Selected ${label}` : `All ${label}`}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}

// Client component wrapper
export function DisplayStudentsPage(studentsParam?: { students: any[] }) {
  const students = studentsParam ? studentsParam.students : [];
  const [selectedStudents, setSelectedStudents] = React.useState<string[]>([]);
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [filterYear, setFilterYear] = React.useState<string>("all");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [filterClass, setFilterClass] = React.useState<string>("all");
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

  // Toggle student selection
  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Select all students
  const selectAllStudents = () => {
    setSelectedStudents(
      selectedStudents.length === filteredStudents.length 
        ? [] 
        : filteredStudents.map(student => student.id)
    );
  };

  // Handle delete student
  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
      return; 
    }

    setIsDeleting(studentId);
    try {
      const result = await deleteStudent(Number(studentId));
      if (result.success) {
        window.location.reload();
      } else {
        alert(`Failed to delete student: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('An error occurred while deleting student');
    } finally {
      setIsDeleting(null);
    }
  };

  // Filter students based on search term and filters
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.className?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesYear = filterYear === "all" || student.year?.toString() === filterYear;
    const matchesStatus = filterStatus === "all" || student.status === filterStatus;
    const matchesClass = filterClass === "all" || student.class === filterClass || student.className === filterClass;

    return matchesSearch && matchesYear && matchesStatus && matchesClass;
  });

  // Get unique values for filters
  const years = [...new Set(students.map(s => s.year).filter(Boolean))].sort();
  const statuses = [...new Set(students.map(s => s.status).filter(Boolean))];
  const classes = [...new Set(students.map(s => s.class || s.className).filter(Boolean))].sort();

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterYear("all");
    setFilterStatus("all");
    setFilterClass("all");
  };

  // Format status badge
  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case 'inactive':
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case 'suspended':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case 'graduated':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Format year badge
  const getYearBadge = (year?: number) => {
    const colors = [
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
      "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
    ];
    const index = (year || 1) - 1;
    return colors[index] || colors[0];
  };

  // Format class badge
  const getClassBadge = (className?: string) => {
    // Create a deterministic color based on class name
    if (!className) return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    
    const colors = [
      "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
      "bg-gradient-to-r from-purple-500 to-purple-600 text-white",
      "bg-gradient-to-r from-green-500 to-green-600 text-white",
      "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white",
      "bg-gradient-to-r from-red-500 to-red-600 text-white",
      "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white",
      "bg-gradient-to-r from-pink-500 to-pink-600 text-white",
      "bg-gradient-to-r from-teal-500 to-teal-600 text-white",
    ];
    
    // Simple hash function to get consistent color for same class name
    const hash = className.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % colors.length;
    return colors[index];
  };

  // Get class icon
  const getClassIcon = (className?: string) => {
    if (!className) return <BookOpen className="w-3 h-3" />;
    
    // Return appropriate icon based on class name pattern
    if (className.toLowerCase().includes('science') || className.toLowerCase().includes('lab')) {
      return <GraduationCap className="w-3 h-3" />;
    } else if (className.toLowerCase().includes('art') || className.toLowerCase().includes('creative')) {
      return <BookOpen className="w-3 h-3" />;
    } else {
      return <BookOpen className="w-3 h-3" />;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:gap-8 mt-6 mb-6">
      <div className="flex flex-col gap-6">
        <ShowcaseSection 
          title="Student Management" 
          className="space-y-6 !p-6 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border border-gray-200/60 dark:border-gray-700/60 rounded-xl shadow-sm"
        >
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Student Directory</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Manage and export student information
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredStudents.length} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/ {students.length}</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  SHOWING / TOTAL
                </div>
              </div>
              {selectedStudents.length > 0 && (
                <div className="px-3 py-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      {selectedStudents.length} selected
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search and Filters Section */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Search Input */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Students
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by name, email, ID, class..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year Level
                </label>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent appearance-none"
                  >
                    <option value="all">All Years</option>
                    {years.map(year => (
                      <option key={year} value={year}>
                        Year {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Class Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Class
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent appearance-none"
                  >
                    <option value="all">All Classes</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent appearance-none"
                  >
                    <option value="all">All Status</option>
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="mt-4 flex justify-end">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="flex items-center gap-2 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </Button>
            </div>

            {/* Active Filters Indicator */}
            {(searchTerm || filterYear !== "all" || filterStatus !== "all" || filterClass !== "all") && (
              <div className="mt-4 flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                    Search: "{searchTerm}"
                    <button 
                      onClick={() => setSearchTerm("")}
                      className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filterYear !== "all" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                    Year: {filterYear}
                    <button 
                      onClick={() => setFilterYear("all")}
                      className="ml-1 hover:text-purple-900 dark:hover:text-purple-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filterClass !== "all" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                    Class: {filterClass}
                    <button 
                      onClick={() => setFilterClass("all")}
                      className="ml-1 hover:text-green-900 dark:hover:text-green-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filterStatus !== "all" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm">
                    Status: {filterStatus}
                    <button 
                      onClick={() => setFilterStatus("all")}
                      className="ml-1 hover:text-yellow-900 dark:hover:text-yellow-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Export Buttons */}
          <ExportButtons 
            students={filteredStudents} 
            selectedStudents={selectedStudents} 
          />

          {/* Desktop Table */}
          <div className="hidden lg:block">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-xs">
              <Table>
                <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-700/50 border-b-2 border-gray-200 dark:border-gray-600">
                  <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                    <TableHead className="w-12 py-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                          onChange={selectAllStudents}
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:checked:bg-blue-500"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white py-4">Student ID</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white py-4">Name</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white py-4">Surname</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white py-4">Email</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white py-4">Phone</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white py-4">Year</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white py-4">Class</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white py-4">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white py-4">Address</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white py-4 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student, index) => (
                      <TableRow 
                        key={student.id} 
                        className={`transition-colors duration-200 ${
                          index % 2 === 0 
                            ? 'bg-white dark:bg-gray-800' 
                            : 'bg-gray-50/50 dark:bg-gray-700/50'
                        } hover:bg-blue-50/30 dark:hover:bg-blue-900/20 border-b border-gray-100 dark:border-gray-700`}
                      >
                        <TableCell className="py-4">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => toggleStudentSelection(student.id)}
                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:checked:bg-blue-500"
                          />
                        </TableCell>
                        <TableCell className="font-mono font-medium text-gray-900 dark:text-white py-4">
                          {student.studentId || `#${student.id}`}
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-white py-4">
                          {student.name}
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-white py-4">
                          {student.surname}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-700 dark:text-gray-300 truncate max-w-[180px]">
                              {student.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {student.phone || "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          {student.year && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getYearBadge(student.year)}`}>
                              Year {student.year}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          {(student.class || student.className) && (
                            <div className="flex items-center gap-2">
                              <div className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${getClassBadge(student.class || student.className)}`}>
                                {getClassIcon(student.class || student.className)}
                                <span>{student.class || student.className}</span>
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          {student.status && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(student.status)}`}>
                              {student.status}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                              {student.address || "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center justify-center gap-3">
                            <Link 
                              href={`/dashboard/users/students/${student.id}/edit`}
                              className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200"
                            >
                              <Edit3 className="w-3 h-3" />
                              Edit
                            </Link>
                            <Link 
                              href={`/dashboard/users/students/${student.id}`}
                              className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors duration-200"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </Link>
                            <button 
                              onClick={() => handleDeleteStudent(student.id, `${student.name} ${student.surname}`)}
                              disabled={isDeleting === student.id}
                              className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-3 h-3" />
                              {isDeleting === student.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-12">
                        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {students.length === 0 ? 'No students found' : 'No matching students'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                          {students.length === 0 
                            ? 'Get started by adding some students to your database.' 
                            : 'Try adjusting your search or filters to find what you\'re looking for.'}
                        </p>
                        <div className="flex gap-3 justify-center">
                          {students.length === 0 ? (
                            <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white">
                              Add First Student
                            </Button>
                          ) : (
                            <Button 
                              onClick={clearFilters}
                              className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800 text-white"
                            >
                              Clear All Filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <div 
                  key={student.id} 
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800 shadow-xs hover:shadow-md dark:hover:shadow-gray-900/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudentSelection(student.id)}
                        className="w-5 h-5 mt-1 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:checked:bg-blue-500"
                      />
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                          {student.name} {student.surname}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            ID: {student.studentId || student.id}
                          </span>
                          {student.year && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getYearBadge(student.year)}`}>
                              Year {student.year}
                            </span>
                          )}
                          {(student.class || student.className) && (
                            <div className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${getClassBadge(student.class || student.className)}`}>
                              {getClassIcon(student.class || student.className)}
                              <span>{student.class || student.className}</span>
                            </div>
                          )}
                          {student.status && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(student.status)}`}>
                              {student.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 truncate">{student.email}</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{student.phone || "N/A"}</span>
                    </div>
                    <div className="flex items-start gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 flex-1">{student.address || "N/A"}</span>
                    </div>
                  </div>

                  <div className="flex justify-between mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Link 
                      href={`/dashboard/users/students/${student.id}/edit`}
                      className="flex items-center gap-2 px-4 py-2 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200 text-sm font-medium"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </Link>
                    <Link 
                      href={`/dashboard/users/students/${student.id}`}
                      className="flex items-center gap-2 px-4 py-2 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors duration-200 text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                    <button 
                      onClick={() => handleDeleteStudent(student.id, `${student.name} ${student.surname}`)}
                      disabled={isDeleting === student.id}
                      className="flex items-center gap-2 px-4 py-2 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                      {isDeleting === student.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {students.length === 0 ? 'No students found' : 'No matching students'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {students.length === 0 
                    ? 'Get started by adding some students to your database.' 
                    : 'Try adjusting your search or filters to find what you\'re looking for.'}
                </p>
                <div className="flex gap-3 justify-center">
                  {students.length === 0 ? (
                    <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white">
                      Add First Student
                    </Button>
                  ) : (
                    <Button 
                      onClick={clearFilters}
                      className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800 text-white"
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {filteredStudents.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center border border-blue-100 dark:border-blue-800">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {filteredStudents.length}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">Showing</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-center border border-green-100 dark:border-green-800">
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {filteredStudents.filter(s => s.status === 'active').length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400 mt-1">Active</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl text-center border border-purple-100 dark:border-purple-800">
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {selectedStudents.length}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400 mt-1">Selected</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl text-center border border-yellow-100 dark:border-yellow-800">
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {filteredStudents.filter(s => s.status === 'suspended').length}
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">Suspended</div>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-center border border-indigo-100 dark:border-indigo-800">
                <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                  {filteredStudents.filter(s => s.status === 'graduated').length}
                </div>
                <div className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">Graduated</div>
              </div>
              <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-xl text-center border border-pink-100 dark:border-pink-800">
                <div className="text-2xl font-bold text-pink-700 dark:text-pink-300">
                  {classes.length}
                </div>
                <div className="text-sm text-pink-600 dark:text-pink-400 mt-1">Classes</div>
              </div>
            </div>
          )}
        </ShowcaseSection>
      </div>
    </div>
  );
}