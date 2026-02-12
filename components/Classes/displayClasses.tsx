"use client";

import React from "react";
import Link from "next/link";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { deleteClass, exportClasses } from "@/app/api/class-actions";

interface ExportButtonsProps {
  classes: any[];
  selectedClasses?: string[];
}

// Client component for export functionality
function ExportButtons({ classes, selectedClasses = [] }: ExportButtonsProps) {
  const hasSelected = selectedClasses.length > 0;
  const dataToExport = hasSelected
    ? classes.filter(cls => selectedClasses.includes(cls.id))
    : classes;

  const handleExport = async (format: 'json' | 'csv' | 'xlsx') => {
    try {
      // Call server action to get export data
      const result = await exportClasses(dataToExport, format);

      if (result) {
        // Client-side download
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

  return (
    <div className="flex flex-col gap-2 mb-4">
      {/* Export All Options */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => handleExport('json')}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          Export all to .json
        </Button>
        <Button
          onClick={() => handleExport('csv')}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          Export all to .csv
        </Button>
        <Button
          onClick={() => handleExport('xlsx')}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          Export all to .xlsx
        </Button>
      </div>

      {/* Export Selected Options */}
      {hasSelected && (
        <div className="flex flex-wrap gap-2 border-t pt-2 mt-2">
          <Button
            onClick={() => handleExport('json')}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Export selected to .json
          </Button>
          <Button
            onClick={() => handleExport('csv')}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Export selected to .csv
          </Button>
          <Button
            onClick={() => handleExport('xlsx')}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Export selected to .xlsx
          </Button>
        </div>
      )}
    </div>
  );
}

export function DisplayClassesPage(classesParam?: { classes: any[] }) {
  const classes = classesParam ? classesParam.classes : [];
  const [selectedClasses, setSelectedClasses] = React.useState<string[]>([]);

  const toggleClassSelection = (classId: string) => {
    setSelectedClasses(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const selectAllClasses = () => {
    setSelectedClasses(
      selectedClasses.length === classes.length
        ? []
        : classes.map(cls => cls.id)
    );
  };

  const handleDelete = async (classId: number) => {
    if (confirm('Are you sure you want to delete this class?')) {
      try {
        const result = await deleteClass(classId);
        if (result.success) {
          // Refresh the page or update the list
          window.location.reload();
        } else {
          alert(result.error);
        }
      } catch (error) {
        alert('Failed to delete class. Please try again.');
      }
    }
  };

  // Function to get badge color based on class section
  const getSectionBadgeColor = (section: string) => {
    switch (section?.toUpperCase()) {
      case 'NURSERY':
        return 'bg-pink-100 text-pink-800';
      case 'PRIMARY':
        return 'bg-purple-100 text-purple-800';
      case 'SECONDARY':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:gap-9 sm:grid-cols-1 mt-6 sm:mt-10 mb-6 sm:mb-10">
        <div className="flex flex-col gap-6 sm:gap-9">
          <ShowcaseSection title="Class List" className="space-y-5.5 !p-4 sm:!p-6.5">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">Class Management</h2>
              <div className="flex items-center justify-between sm:justify-normal gap-4">
                <div className="text-sm text-gray-500 whitespace-nowrap">
                  {selectedClasses.length > 0
                    ? `${selectedClasses.length} selected`
                    : `${classes.length} total classes`
                  }
                </div>
                <Link
                  href="/academics/classes/new"
                  className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-700 text-sm sm:text-base whitespace-nowrap"
                >
                  Add New Class
                </Link>
              </div>
            </div>

            {/* Export Buttons */}
            <ExportButtons
              classes={classes}
              selectedClasses={selectedClasses}
            />

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={classes.length > 0 && selectedClasses.length === classes.length}
                        onChange={selectAllClasses}
                        className="w-4 h-4"
                      />
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Class ID</TableHead>
                    <TableHead className="whitespace-nowrap">Class Name</TableHead>
                    <TableHead className="whitespace-nowrap">Section</TableHead>
                    <TableHead className="whitespace-nowrap">Teachers</TableHead>
                    <TableHead className="whitespace-nowrap">Subjects</TableHead>
                    <TableHead className="whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedClasses.includes(cls.id)}
                          onChange={() => toggleClassSelection(cls.id)}
                          className="w-4 h-4"
                        />
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{cls.id}</TableCell>
                      <TableCell className="font-semibold whitespace-nowrap">{cls.className}</TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getSectionBadgeColor(cls.classSection)} whitespace-nowrap`}>
                          {cls.classSection || 'Not specified'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {cls.teachers && cls.teachers.map((teacher: string, index: number) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded truncate"
                              title={teacher}
                            >
                              {teacher}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {cls.subjects && cls.subjects.map((subject: string, index: number) => (
                            <span
                              key={index}
                              className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded truncate"
                              title={subject}
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                          <Link
                            href={`/academics/classes/${cls.id}/edit`}
                            className="text-blue-600 hover:underline text-sm whitespace-nowrap"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/academics/classes/${cls.id}`}
                            className="text-green-600 hover:underline text-sm whitespace-nowrap"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleDelete(cls.id)}
                            className="text-red-600 hover:underline text-sm whitespace-nowrap text-left sm:text-left"
                          >
                            Delete
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {classes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No classes found. <Link href="/academics/classes/new" className="text-blue-600 hover:underline">Create your first class</Link>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </ShowcaseSection>
        </div>
      </div>
    </>
  );
}