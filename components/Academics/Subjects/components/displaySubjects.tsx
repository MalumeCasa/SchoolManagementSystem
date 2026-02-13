// components/subject/displaySubjects.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
// Assuming these are standard component imports
import { ShowcaseSection, ShowcaseSectionDesc } from "@/components/Layouts/showcase-section";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
// Assuming Input is a custom component that wraps a standard HTML input
import Input from "@/components/FormElements/InputGroup"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"; 

// Lucide Icons
import { Search, Filter, Download, Plus, Clock, Users, BookOpen, Trash2, Edit, Eye, X, Table as TableIcon, BarChart3, LayoutGrid } from "lucide-react";
// Assuming this Subject type is imported from @api/types
import type { Subject } from "@api/types"; 
// Assuming this action exists
import { deleteSubject } from "@api/subject-actions"; 

interface DisplaySubjectsPageProps {
  subjects?: Subject[];
}

// Helper function to safely extract unique values for filters
const getUniqueValues = (subjects: Subject[], key: 'teacher' | 'className' | 'classSection'): string[] => {
  // Filters out null or undefined values before mapping
  const values = subjects.map(s => s[key]).filter((v): v is string => v !== null && v !== undefined);
  return Array.from(new Set(values));
};

export function DisplaySubjectsPage({ subjects = [] }: DisplaySubjectsPageProps) {
  const [isClient, setIsClient] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [filterTeacher, setFilterTeacher] = useState<string>("all");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterSection, setFilterSection] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid" | "overview">("table");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filter options setup
  // Use unique values for filtering. We must assume these properties might be null or undefined
  const uniqueTeachers = useMemo(() => getUniqueValues(subjects, 'teacher'), [subjects]);
  const uniqueClasses = useMemo(() => getUniqueValues(subjects, 'className'), [subjects]);
  const uniqueSections = useMemo(() => getUniqueValues(subjects, 'classSection'), [subjects]);
  
  // Filtering Logic
  const filteredSubjects = useMemo(() => {
    return subjects.filter(subject => {
      // Safely check for null/undefined before comparing with filters
      const teacherMatch = filterTeacher === "all" || subject.teacher === filterTeacher;
      const classMatch = filterClass === "all" || subject.className === filterClass;
      const sectionMatch = filterSection === "all" || subject.classSection === filterSection;
      
      const searchLower = searchTerm.toLowerCase();
      
      // Apply null checks here too for the search term matching
      const searchMatch = !searchTerm || 
        (subject.name ?? '').toLowerCase().includes(searchLower) ||
        (subject.teacher ?? '').toLowerCase().includes(searchLower) ||
        (subject.className ?? '').toLowerCase().includes(searchLower) ||
        (subject.classSection ?? '').toLowerCase().includes(searchLower);

      return teacherMatch && classMatch && sectionMatch && searchMatch;
    });
  }, [subjects, filterTeacher, filterClass, filterSection, searchTerm]);

  // Selection handlers
  const isSubjectSelected = (id: string | number) => selectedSubjects.includes(String(id));

  const handleSelect = (id: string | number) => {
    const subjectId = String(id);
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(i => i !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSubjects.length === filteredSubjects.length && filteredSubjects.length > 0) {
      setSelectedSubjects([]);
    } else {
      setSelectedSubjects(filteredSubjects.map(s => String(s.id)));
    }
  };
  
  const handleDelete = async (id: string | number) => {
      if (!window.confirm('Are you sure you want to delete this subject?')) {
        return;
      }
      const subjectId = String(id);
      setDeletingId(subjectId);
      
      // FIX: Convert the ID to a number for the API call, as it expects 'number'.
      // This resolves the TypeScript error reported by the user.
      const idForApi = Number(id);
      
      // Assume deleteSubject returns { success: boolean, error?: string }
      const result = await deleteSubject(idForApi); 
      setDeletingId(null);
      
      if (result.success) {
          // In a real app, you would refresh the list of subjects here.
          // For a client-side mock, you might filter the state.
          alert(`Subject ${subjectId} deleted successfully. (You would refresh the data here)`);
      } else {
          alert(`Failed to delete subject: ${result.error}`);
      }
  };


  const renderTable = () => (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px] text-center">
              <Checkbox
                checked={selectedSubjects.length === filteredSubjects.length && filteredSubjects.length > 0}
                onCheckedChange={handleSelectAll}
                disabled={filteredSubjects.length === 0}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Subject Name</TableHead>
            <TableHead>Teacher</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Topics</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject) => (
              <TableRow 
                key={subject.id} 
                className={isSubjectSelected(subject.id) ? "bg-muted/50" : ""}
              >
                <TableCell className="w-[40px] text-center">
                  <Checkbox
                    checked={isSubjectSelected(subject.id)}
                    onCheckedChange={() => handleSelect(subject.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                    {/* FIX 1: Handle nullable string properties with ?? 'N/A' */}
                    {subject.name ?? 'N/A'}
                </TableCell>
                <TableCell>
                    {subject.teacher ?? 'N/A'}
                </TableCell>
                <TableCell>
                    {subject.schedule ?? 'N/A'}
                </TableCell>
                <TableCell>
                    {subject.duration ?? 'N/A'}
                </TableCell>
                <TableCell>
                    {/* Safely display class name and section */}
                    {subject.className ?? 'N/A'} {subject.classSection ? `(${subject.classSection})` : ''}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {/* FIX 2: Use Optional Chaining for nullable array property (topics) */}
                    {subject.topics?.slice(0, 3).map((topic, topicIdx) => (
                      <Badge key={topicIdx} variant="secondary" className="whitespace-nowrap">
                        {topic}
                      </Badge>
                    ))}
                    {/* Fallback check if topics is null or empty array */}
                    {(!subject.topics || subject.topics.length === 0) && (
                      <span className="text-muted-foreground text-sm">No topics</span>
                    )}
                    {(subject.topics && subject.topics.length > 3) && (
                        <span className="text-muted-foreground text-xs self-center">
                            +{subject.topics.length - 3} more
                        </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Link href={`/academics/subjects/${subject.id}/view`}>
                      <Button variant="outline" size="icon" title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/academics/subjects/${subject.id}/edit`}>
                      <Button variant="outline" size="icon" title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    {/* Link to Progress/Curriculum view, assuming this exists */}
                    <Link href={`/academics/subjects/${subject.id}/curriculum`}>
                      <Button variant="default" size="icon" title="Curriculum">
                          <BookOpen className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="icon"
                      title="Delete"
                      onClick={() => handleDelete(subject.id)}
                      disabled={deletingId === String(subject.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                No subjects found matching the current filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
  
  const renderGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredSubjects.length > 0 ? (
        filteredSubjects.map((subject) => (
          <Card key={subject.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold">
                {subject.name ?? 'N/A'}
              </CardTitle>
              <Checkbox
                checked={isSubjectSelected(subject.id)}
                onCheckedChange={() => handleSelect(subject.id)}
                className="h-5 w-5"
              />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> 
                  Teacher: <span className="text-foreground font-medium">{subject.teacher ?? 'N/A'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> 
                  Schedule: <span className="text-foreground font-medium">{subject.schedule ?? 'N/A'}</span>
                </p>
              </div>
              
              <div className="pt-2 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-1">Topics</p>
                <div className="flex flex-wrap gap-1">
                  {/* FIX 2: Use Optional Chaining for nullable array property (topics) */}
                  {subject.topics?.slice(0, 4).map((topic, topicIdx) => (
                    <Badge key={topicIdx} variant="secondary">
                      {topic}
                    </Badge>
                  ))}
                  {/* Fallback check */}
                  {(!subject.topics || subject.topics.length === 0) && (
                    <span className="text-muted-foreground text-sm">No topics assigned</span>
                  )}
                  {(subject.topics && subject.topics.length > 4) && (
                    <Badge variant="outline" className="text-xs">
                        +{subject.topics.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Optional: Assessment display. Assuming 'assessments' is also nullable */}
              <div className="pt-2 border-t border-border">
                  <p className="text-sm font-medium text-foreground mb-1">Assessments</p>
                  <div className="flex flex-wrap gap-1">
                      {subject.assessments?.slice(0, 2).map((assessment, idx) => (
                          <Badge key={idx} variant="default" className="text-xs">
                              {assessment.type}
                          </Badge>
                      ))}
                      {(!subject.assessments || subject.assessments.length === 0) && (
                          <span className="text-muted-foreground text-xs">No assessments scheduled</span>
                      )}
                      {(subject.assessments && subject.assessments.length > 2) && (
                          <Badge variant="outline" className="text-xs">
                              +{subject.assessments.length - 2} more
                          </Badge>
                      )}
                  </div>
              </div>


              <div className="flex justify-between pt-2 border-t border-border">
                <Link href={`/academics/subjects/${subject.id}/view`} className="flex-1 mr-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-4 w-4 mr-2" /> View
                  </Button>
                </Link>
                <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(subject.id)}
                    disabled={deletingId === String(subject.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="col-span-full text-center py-12 border border-dashed rounded-lg text-muted-foreground">
          <BookOpen className="h-10 w-10 mx-auto mb-3" />
          <p>No subjects found matching the current filters.</p>
        </div>
      )}
    </div>
  );

  const renderOverview = () => {
      // Placeholder for a custom overview dashboard view
      return (
        <div className="text-center py-12 border border-dashed rounded-lg text-muted-foreground">
          <BarChart3 className="h-10 w-10 mx-auto mb-3" />
          <p>Overview dashboard for Subject Management is under construction. Switch to Table or Grid view.</p>
        </div>
      );
  };


  const renderView = () => {
      switch (viewMode) {
          case 'table':
              return renderTable();
          case 'grid':
              return renderGrid();
          case 'overview':
              return renderOverview();
      }
  };


  if (!isClient) {
      return <div className="p-6">Loading subject manager...</div>;
  }

  return (
    <ShowcaseSectionDesc 
      title="Subject Management"
      description="Manage and organize subjects, teachers, and class assignments efficiently."
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Subject Management</h1>
        <div className="flex space-x-2">
          <Link href="/academics/subjects/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Create New Subject
            </Button>
          </Link>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-grow">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by subject name, teacher, or class..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-muted-foreground hidden sm:block" />
              
              <Select value={filterTeacher} onValueChange={setFilterTeacher}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teachers</SelectItem>
                  {uniqueTeachers.map(teacher => (
                    <SelectItem key={teacher} value={teacher}>{teacher}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {uniqueClasses.map(className => (
                    <SelectItem key={className} value={className}>{className}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* View Switcher */}
            <div className="flex gap-1 border rounded-md p-1 bg-muted">
                <Button 
                    variant={viewMode === 'table' ? 'default' : 'ghost'} 
                    size="icon" 
                    onClick={() => setViewMode('table')}
                    title="Table View"
                >
                    <TableIcon className="h-5 w-5" />
                </Button>
                <Button 
                    variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                    size="icon" 
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                >
                    <LayoutGrid className="h-5 w-5" />
                </Button>
                <Button 
                    variant={viewMode === 'overview' ? 'default' : 'ghost'} 
                    size="icon" 
                    onClick={() => setViewMode('overview')}
                    title="Overview Dashboard"
                >
                    <BarChart3 className="h-5 w-5" />
                </Button>
            </div>

          </div>
        </CardContent>
      </Card>
      
      {/* Bulk Actions */}
      {selectedSubjects.length > 0 && (
          <div className="mb-4 flex items-center space-x-3 p-3 border rounded-md bg-yellow-50 text-yellow-800">
              <Badge variant="outline">{selectedSubjects.length} selected</Badge>
              <Button variant="destructive" size="sm" onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${selectedSubjects.length} subjects?`)) {
                      // Placeholder for bulk delete logic
                      alert('Bulk delete feature not yet fully implemented.');
                      setSelectedSubjects([]);
                  }
              }}>
                  <Trash2 className="h-4 w-4 mr-2" /> Bulk Delete
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedSubjects([])}>
                  <X className="h-4 w-4 mr-2" /> Clear Selection
              </Button>
          </div>
      )}

      {/* Main Content View */}
      {renderView()}
    </ShowcaseSectionDesc>
  );
}