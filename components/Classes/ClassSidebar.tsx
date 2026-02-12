"use client"

import React from 'react';
import {
  ChevronRight,
  Pencil,
  Trash2,
  Check,
  X,
  Plus,
} from "lucide-react";
import { ClassSection, ActiveView, EditingClass, Student } from '@/app/api/types';

interface ClassSidebarProps {
  classSections: ClassSection[];
  expandedSections: string[];
  selectedClass: string | null;
  editingClass: EditingClass | null;
  editValue: string;
  editingSection: string | null;
  sectionEditValue: string;
  studentsDataState: Record<string, Student[]>;
  onToggleSection: (section: string) => void;
  onSelectClass: (className: string) => void;
  onStartEditing: (sectionName: string, classIndex: number, currentName: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDeleteClass: (sectionName: string, classIndex: number, className: string) => void;
  onStartEditingSection: (sectionName: string) => void;
  onSaveSectionEdit: () => void;
  onCancelSectionEdit: () => void;
  onDeleteSection: (sectionName: string) => void;
  onAddClassToSection: (sectionName: string) => void;
  onAddNewSection: () => void;
  onSetEditValue: (value: string) => void;
  onSetSectionEditValue: (value: string) => void;
}

const ClassSidebar: React.FC<ClassSidebarProps> = ({
  classSections,
  expandedSections,
  selectedClass,
  editingClass,
  editValue,
  editingSection,
  sectionEditValue,
  studentsDataState,
  onToggleSection,
  onSelectClass,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onDeleteClass,
  onStartEditingSection,
  onSaveSectionEdit,
  onCancelSectionEdit,
  onDeleteSection,
  onAddClassToSection,
  onAddNewSection,
  onSetEditValue,
  onSetSectionEditValue,
}) => {
  return (
    <aside className="w-full bg-sidebar border border-sidebar-border rounded-lg p-4 lg:w-64 lg:sticky lg:top-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-sidebar-foreground">Class Sections</h2>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded w-fit">
          {Object.keys(studentsDataState).length} classes with data
        </span>
      </div>
      <nav className="space-y-2 max-h-[60vh] overflow-y-auto">
        {classSections.map((section) => (
          <div key={section.name} className="space-y-1">
            {editingSection === section.name ? (
              <div className="flex items-center gap-1 px-2 py-2">
                <input
                  type="text"
                  value={sectionEditValue}
                  onChange={(e) => onSetSectionEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSaveSectionEdit()
                    if (e.key === "Escape") onCancelSectionEdit()
                  }}
                  className="flex-1 px-2 py-1 text-sm bg-background border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
                <button
                  onClick={onSaveSectionEdit}
                  className="p-1 hover:bg-green-500/10 rounded text-green-500 transition-colors"
                  title="Save"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={onCancelSectionEdit}
                  className="p-1 hover:bg-red-500/10 rounded text-red-500 transition-colors"
                  title="Cancel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 group">
                <button
                  onClick={() => onToggleSection(section.name)}
                  className="flex items-center justify-between flex-1 px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors"
                >
                  <span className="truncate mr-2">{section.name}</span>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform flex-shrink-0 ${
                      expandedSections.includes(section.name) ? "rotate-90" : ""
                    }`}
                  />
                </button>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onStartEditingSection(section.name)
                    }}
                    className="p-1 hover:bg-blue-500/10 rounded text-blue-500 transition-colors"
                    title="Rename section"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteSection(section.name)
                    }}
                    className="p-1 hover:bg-red-500/10 rounded text-red-500 transition-colors"
                    title="Delete section"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
            {expandedSections.includes(section.name) && (
              <ul className="ml-2 md:ml-4 space-y-1">
                {section.classes.map((className, idx) => {
                  const hasStudents = studentsDataState[className] && studentsDataState[className].length > 0;
                  return (
                    <li key={`${className}-${idx}`}>
                      {editingClass?.section === section.name && editingClass?.index === idx ? (
                        <div className="flex items-center gap-1 px-2 py-1.5">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => onSetEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") onSaveEdit()
                              if (e.key === "Escape") onCancelEdit()
                            }}
                            className="flex-1 px-2 py-1 text-sm bg-background border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            autoFocus
                          />
                          <button
                            onClick={onSaveEdit}
                            className="p-1 hover:bg-green-500/10 rounded text-green-500 transition-colors"
                            title="Save"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={onCancelEdit}
                            className="p-1 hover:bg-red-500/10 rounded text-red-500 transition-colors"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 group">
                          <button
                            onClick={() => onSelectClass(className)}
                            className={`flex-1 text-left px-3 py-1.5 text-sm rounded-md transition-colors w-full ${
                              selectedClass === className
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="truncate mr-2">{className}</span>
                              {hasStudents && (
                                <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded flex-shrink-0">
                                  {studentsDataState[className]?.length}
                                </span>
                              )}
                            </div>
                          </button>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onStartEditing(section.name, idx, className)
                              }}
                              className="p-1 hover:bg-blue-500/10 rounded text-blue-500 transition-colors"
                              title="Edit class name"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteClass(section.name, idx, className)
                              }}
                              className="p-1 hover:bg-red-500/10 rounded text-red-500 transition-colors"
                              title="Delete class"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
                <li>
                  <button
                    onClick={() => onAddClassToSection(section.name)}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-md transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Class</span>
                  </button>
                </li>
              </ul>
            )}
          </div>
        ))}
      </nav>
      <button
        onClick={onAddNewSection}
        className="flex items-center justify-center gap-2 w-full mt-4 px-3 py-2 text-sm font-medium text-sidebar-foreground bg-sidebar-accent hover:bg-sidebar-accent/80 rounded-md transition-colors"
      >
        <Plus className="h-4 w-4" />
        <span>Add Section</span>
      </button>
    </aside>
  );
};

export default ClassSidebar;