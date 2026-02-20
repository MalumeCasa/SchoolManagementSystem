"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import InputGroup from "@/components/FormElements/InputGroup";
import { updateSubject, createSubject, checkDuplicateSubject } from "@api/subject-actions";
import { getAllTeachersForSubjects } from "@api/actions";
import type { Subject } from "@api/db/types";

interface NewSubjectFormProps {
    subject?: Subject;
    isEdit?: boolean;
}

interface Assessment {
    type: string;
    date: string;
}

interface ScheduleSlot {
    day: string;
    startTime: string;
    endTime: string;
    recurring: boolean;
}

interface TeacherOption {
    id: number;
    staffId: number;
    name: string;
    surname: string;
    email: string;
    role: string;
    displayName: string;
}

// ─── Class Configuration ──────────────────────────────────────────────────────

const CLASS_SECTIONS = [
    { value: "nursery",   label: "Nursery",   emoji: "🌱", desc: "Ages 0 – 6"   },
    { value: "primary",   label: "Primary",   emoji: "📚", desc: "Grade 1 – 7"  },
    { value: "secondary", label: "Secondary", emoji: "🎓", desc: "Grade 8 – 12" },
] as const;

type SectionValue = typeof CLASS_SECTIONS[number]["value"];

/** The three named nursery classes with their age ranges */
const NURSERY_CLASSES = [
    { value: "Roses",    label: "🌹 Roses",    ageRange: "Ages 0 – 2" },
    { value: "Giraffes", label: "🦒 Giraffes", ageRange: "Ages 3 – 4" },
    { value: "Tigers",   label: "🐯 Tigers",   ageRange: "Ages 5 – 6" },
] as const;

/** Auto-infer the section from a grade number */
function gradeToSection(gradeNum: number): SectionValue {
    if (gradeNum <= 7) return "primary";
    return "secondary"; // 8–12
}

/** Extract section from a "Grade N" string, or null for custom */
function getSectionForGradeValue(gradeValue: string): SectionValue | null {
    const m = gradeValue.match(/^Grade (\d{1,2})$/);
    if (!m) return null;
    return gradeToSection(parseInt(m[1], 10));
}

/** Grades that belong to each section (for highlight mapping) */
const SECTION_GRADES: Record<SectionValue, string[]> = {
    nursery:   NURSERY_CLASSES.map(c => c.value),
    primary:   Array.from({ length: 7 },  (_, i) => `Grade ${i + 1}`),
    secondary: Array.from({ length: 5 },  (_, i) => `Grade ${i + 8}`),
};

// Colour tokens per section
const SEC: Record<SectionValue, { active: string; soft: string; dot: string }> = {
    nursery:   {
        active: "bg-emerald-500 border-emerald-500 text-white",
        soft:   "bg-emerald-50 border-emerald-300 text-emerald-700 ring-1 ring-emerald-300",
        dot:    "bg-emerald-500",
    },
    primary:   {
        active: "bg-blue-500 border-blue-500 text-white",
        soft:   "bg-blue-50 border-blue-300 text-blue-700 ring-1 ring-blue-300",
        dot:    "bg-blue-500",
    },
    secondary: {
        active: "bg-violet-600 border-violet-600 text-white",
        soft:   "bg-violet-50 border-violet-300 text-violet-700 ring-1 ring-violet-300",
        dot:    "bg-violet-600",
    },
};

// Grade 1-12 + Custom
const GRADE_OPTIONS = [
    ...Array.from({ length: 12 }, (_, i) => ({ value: `Grade ${i + 1}`, label: `Grade ${i + 1}` })),
    { value: "__custom__", label: "Custom" },
];

// Group label suggestions
const GROUP_SUGGESTIONS = ["Extra Class", "Remedial", "Advanced", "Enrichment", "Catch-Up", "Honours", "Tutorial"];

// ─── ClassNamePicker ──────────────────────────────────────────────────────────

interface ClassNamePickerProps {
    value: string;
    classSection: SectionValue;         // so grade buttons can show soft highlights matching current section
    onChange: (className: string) => void;
    onSectionChange: (section: SectionValue) => void;
    onGradeChange: (grade: string) => void;  // bubble grade up for the section badge
}

function ClassNamePicker({ value, classSection, onChange, onSectionChange, onGradeChange }: ClassNamePickerProps) {
    const [selectedGrade, setSelectedGrade]             = useState<string>("");
    const [selectedNursery, setSelectedNursery]         = useState<string>("");
    const [customName, setCustomName]                   = useState<string>("");
    const [groupLabel, setGroupLabel]                   = useState<string>("");
    const [groupInput, setGroupInput]                   = useState<string>("");
    const [useCustomSuggestion, setUseCustomSuggestion] = useState(false);

    // One-time parse on edit
    useEffect(() => {
        if (!value) return;
        // Check if it's a known nursery class name
        const nurseryMatch = NURSERY_CLASSES.find(n => value === n.value);
        if (nurseryMatch) {
            setSelectedGrade("__nursery__");
            setSelectedNursery(nurseryMatch.value);
            onGradeChange("__nursery__");
            onSectionChange("nursery");
            return;
        }
        const gm = value.match(/^(Grade \d{1,2})(.*)?$/);
        if (gm) {
            const grade  = gm[1];
            const suffix = (gm[2] || "").replace(/^\s*[-–]\s*/, "").trim();
            setSelectedGrade(grade);
            setGroupLabel(suffix);
            setGroupInput(suffix);
            onGradeChange(grade);
        } else {
            setSelectedGrade("__custom__");
            setCustomName(value);
            onGradeChange("__custom__");
        }
    }, []); // intentionally only on mount

    // Re-emit combined name whenever parts change
    useEffect(() => {
        let combined = "";
        if (selectedGrade === "__nursery__") {
            combined = selectedNursery;
        } else if (selectedGrade === "__custom__") {
            combined = customName.trim();
        } else if (selectedGrade) {
            combined = groupLabel ? `${selectedGrade} – ${groupLabel}` : selectedGrade;
        }
        onChange(combined);
    }, [selectedGrade, selectedNursery, customName, groupLabel]);

    const handleGradeClick = (grade: string) => {
        setSelectedGrade(grade);
        onGradeChange(grade);
        setCustomName("");
        setSelectedNursery("");
        setGroupLabel(""); setGroupInput("");
        if (grade === "__nursery__") {
            onSectionChange("nursery");
        } else if (grade !== "__custom__") {
            const auto = getSectionForGradeValue(grade);
            if (auto) onSectionChange(auto);
        }
    };

    const handleNurseryClick = (nc: typeof NURSERY_CLASSES[number]) => {
        setSelectedNursery(nc.value);
    };

    const applyGroup = (s: string) => { setGroupLabel(s); setGroupInput(s); setUseCustomSuggestion(false); };
    const clearGroup = () => { setGroupLabel(""); setGroupInput(""); setUseCustomSuggestion(false); };

    const preview =
        selectedGrade === "__nursery__"
            ? selectedNursery
            : selectedGrade === "__custom__"
            ? customName.trim()
            : selectedGrade
            ? (groupLabel ? `${selectedGrade} – ${groupLabel}` : selectedGrade)
            : "";

    // Button styling per grade
    const gradeClass = (opt: typeof GRADE_OPTIONS[number]) => {
        const gs = getSectionForGradeValue(opt.value);
        const isSelected = selectedGrade === opt.value;

        if (isSelected) {
            if (gs) return SEC[gs].active + " shadow-md scale-105";
            if (opt.value === "__nursery__") return SEC.nursery.active + " shadow-md scale-105";
            if (opt.value === "__custom__")  return "bg-gray-700 border-gray-700 text-white shadow-md scale-105";
        }
        if (opt.value === "__nursery__" && classSection === "nursery" && !isSelected) return SEC.nursery.soft;
        if (gs && gs === classSection && !isSelected) return SEC[gs].soft;

        return "border-stroke bg-white text-gray-700 hover:border-primary hover:bg-primary/5 dark:border-form-strokedark dark:bg-form-input dark:text-white";
    };

    // Preview badge colour
    const previewSec: SectionValue =
        selectedGrade === "__nursery__" ? "nursery"
        : getSectionForGradeValue(selectedGrade) ?? "primary";

    // Selected nursery class detail (for age range display)
    const nurseryDetail = NURSERY_CLASSES.find(n => n.value === selectedNursery);

    return (
        <div className="w-full space-y-4">

            {/* Grade / class grid */}
            <div>
                <label className="mb-2 block text-sm font-semibold text-black dark:text-white">CLASS / GRADE *</label>

                {/* Legend */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {CLASS_SECTIONS.map(s => (
                        <span key={s.value} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${SEC[s.value].soft}`}>
                            <span className={`w-2 h-2 rounded-full ${SEC[s.value].dot}`}></span>
                            {s.emoji} {s.label} ({s.desc})
                        </span>
                    ))}
                </div>

                {/* Nursery row */}
                <div className="mb-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600 mb-1.5">🌱 Nursery Classes</p>
                    <div className="grid grid-cols-3 gap-2">
                        {NURSERY_CLASSES.map((nc) => {
                            const isActive = selectedGrade === "__nursery__" && selectedNursery === nc.value;
                            const isSoftlit = classSection === "nursery" && !isActive;
                            return (
                                <button
                                    key={nc.value}
                                    type="button"
                                    onClick={() => {
                                        if (selectedGrade !== "__nursery__") handleGradeClick("__nursery__");
                                        handleNurseryClick(nc);
                                    }}
                                    className={`flex flex-col items-center justify-center rounded-xl border-2 py-3 px-2 text-center transition-all duration-150 ${
                                        isActive
                                            ? SEC.nursery.active + " shadow-md"
                                            : isSoftlit
                                            ? SEC.nursery.soft
                                            : "border-stroke bg-white text-gray-700 hover:border-emerald-400 hover:bg-emerald-50 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                    }`}
                                >
                                    <span className="text-xl mb-0.5">{nc.label.split(" ")[0]}</span>
                                    <span className="text-xs font-semibold">{nc.value}</span>
                                    <span className={`text-[10px] mt-0.5 ${isActive ? "opacity-75" : "text-gray-400"}`}>{nc.ageRange}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Grade 1–12 + Custom row */}
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">📚 Primary & Secondary Grades</p>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                        {GRADE_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleGradeClick(opt.value)}
                                className={`rounded-lg border py-2 px-1 text-xs font-medium transition-all duration-150 ${gradeClass(opt)} ${
                                    opt.value === "__custom__" ? "col-span-2 sm:col-span-1" : ""
                                }`}
                            >
                                {opt.value === "__custom__" ? "✏️ Custom" : opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Nursery — no further input needed, class is already chosen */}
            {selectedGrade === "__nursery__" && selectedNursery && (
                <div className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 ${SEC.nursery.soft}`}>
                    <span className="text-2xl">{NURSERY_CLASSES.find(n => n.value === selectedNursery)?.label.split(" ")[0]}</span>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600/70">Nursery Class Selected</p>
                        <p className="text-sm font-bold text-emerald-800">{selectedNursery}</p>
                        {nurseryDetail && (
                            <p className="text-xs text-emerald-600 mt-0.5">{nurseryDetail.ageRange}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Custom name input */}
            {selectedGrade === "__custom__" && (
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">Custom Class Name *</label>
                    <input
                        type="text"
                        placeholder="e.g., ECD Group A, Saturday Art Club, Prefects"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full rounded border border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        required
                    />
                </div>
            )}

            {/* Group / specialisation — only for Grade 1–12 */}
            {selectedGrade && selectedGrade !== "__custom__" && selectedGrade !== "__nursery__" && (
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
                        Class Group / Specialisation{" "}
                        <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">e.g. <em>Maths Extra Class for Grade 12</em></p>

                    <div className="flex flex-wrap gap-2 mb-3">
                        {GROUP_SUGGESTIONS.map((s) => (
                            <button key={s} type="button" onClick={() => applyGroup(s)}
                                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                                    groupLabel === s
                                        ? "border-primary bg-primary text-white"
                                        : "border-stroke bg-gray-50 text-gray-600 hover:border-primary hover:text-primary dark:border-strokedark dark:bg-form-input dark:text-gray-300"
                                }`}>
                                {s}
                            </button>
                        ))}
                        <button type="button" onClick={() => { setUseCustomSuggestion(true); setGroupLabel(""); setGroupInput(""); }}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                                useCustomSuggestion && !GROUP_SUGGESTIONS.includes(groupLabel)
                                    ? "border-primary bg-primary text-white"
                                    : "border-stroke bg-gray-50 text-gray-600 hover:border-primary hover:text-primary dark:border-strokedark dark:bg-form-input dark:text-gray-300"
                            }`}>
                            + Own label
                        </button>
                        {groupLabel && (
                            <button type="button" onClick={clearGroup}
                                className="rounded-full border border-red-300 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-all">
                                ✕ Clear
                            </button>
                        )}
                    </div>

                    {(useCustomSuggestion || (groupLabel && !GROUP_SUGGESTIONS.includes(groupLabel))) && (
                        <input
                            type="text"
                            placeholder="e.g., Extra Class, Honours, Saturday Group"
                            value={groupInput}
                            onChange={(e) => { setGroupInput(e.target.value); setGroupLabel(e.target.value); }}
                            className="w-full rounded border border-stroke bg-transparent py-2.5 px-4 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        />
                    )}
                </div>
            )}

            {/* Preview — grades only (nursery has its own card above) */}
            {preview && selectedGrade !== "__nursery__" && (
                <div className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 transition-all ${SEC[previewSec].soft}`}>
                    <span className="text-xl">🏫</span>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide opacity-60">Class Name Preview</p>
                        <p className="text-sm font-bold">{preview}</p>
                    </div>
                </div>
            )}

            <input type="hidden" name="className" value={preview} />
        </div>
    );
}

// ─── ClassSectionPicker ───────────────────────────────────────────────────────

interface ClassSectionPickerProps {
    value: SectionValue;
    onChange: (s: SectionValue) => void;
    selectedGrade: string;
}

function ClassSectionPicker({ value, onChange, selectedGrade }: ClassSectionPickerProps) {
    return (
        <div className="mb-4.5">
            <label className="mb-2 block text-sm font-semibold text-black dark:text-white">CLASS SECTION *</label>
            <p className="text-xs text-gray-500 mb-3">
                Automatically set based on grade selected. You can override if needed.
            </p>

            <div className="flex gap-3 flex-wrap">
                {CLASS_SECTIONS.map((section) => {
                    const isActive  = value === section.value;
                    const grades    = SECTION_GRADES[section.value];

                    return (
                        <button
                            key={section.value}
                            type="button"
                            onClick={() => onChange(section.value)}
                            className={`flex flex-col items-start gap-1 rounded-xl border-2 px-4 py-3 min-w-[140px] transition-all duration-150 ${
                                isActive
                                    ? SEC[section.value].active + " shadow-lg"
                                    : "border-stroke bg-white text-gray-700 hover:bg-gray-50 dark:bg-form-input dark:border-form-strokedark dark:text-white"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-base">{section.emoji}</span>
                                <span className="text-sm font-semibold">{section.label}</span>
                            </div>
                            <span className={`text-xs ${isActive ? "opacity-75" : "text-gray-400"}`}>
                                {section.value === "nursery"
                                    ? "Ages 0 – 6"
                                    : grades.length > 0
                                    ? `${grades[0]} – ${grades[grades.length - 1]}`
                                    : "Custom / Pre-Grade"}
                            </span>

                            {/* Show nursery class names when nursery is active */}
                            {isActive && section.value === "nursery" && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {NURSERY_CLASSES.map(nc => (
                                        <span key={nc.value} className="text-[10px] rounded-full px-2 py-0.5 bg-white/30 font-medium flex items-center gap-0.5">
                                            {nc.label.split(" ")[0]} {nc.value}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Show which grades belong here when primary/secondary is active */}
                            {isActive && section.value !== "nursery" && grades.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {grades.map(g => (
                                        <span key={g} className="text-[10px] rounded px-1.5 py-0.5 bg-white/25 font-medium">
                                            {g.replace("Grade ", "Gr ")}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Auto-detect feedback */}
            {selectedGrade && selectedGrade !== "__custom__" && (
                <p className="mt-2.5 text-xs text-gray-500 flex items-center gap-1.5">
                    <span>⚡</span>
                    {selectedGrade === "__nursery__" ? (
                        <><span>Nursery class selected →</span> <strong className="capitalize">{value}</strong></>
                    ) : (
                        <><strong>{selectedGrade}</strong><span>was auto-assigned to</span><strong className="capitalize">{value}</strong></>
                    )}
                </p>
            )}

            <input type="hidden" name="classSection" value={value} />
        </div>
    );
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export default function NewSubjectForm({ user, subject, isEdit = false }: NewSubjectFormProps & { user: any }) {
    const [isClient, setIsClient]                             = useState(false);
    const [assessments, setAssessments]                       = useState<Assessment[]>([]);
    const [newAssessment, setNewAssessment]                   = useState({ type: "", date: "" });
    const [scheduleSlots, setScheduleSlots]                   = useState<ScheduleSlot[]>([]);
    const [newScheduleSlot, setNewScheduleSlot]               = useState<ScheduleSlot>({ day: "Monday", startTime: "09:00", endTime: "10:00", recurring: true });
    const [teachers, setTeachers]                             = useState<TeacherOption[]>([]);
    const [selectedTeacherStaffId, setSelectedTeacherStaffId] = useState<number | "">("");
    const [className, setClassName]                           = useState<string>("");
    const [classSection, setClassSection]                     = useState<SectionValue>("primary");
    const [pickerGrade, setPickerGrade]                       = useState<string>("");
    const [loadingTeachers, setLoadingTeachers]               = useState(false);
    const [isSubmitting, setIsSubmitting]                     = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchTeachers = async () => {
            setLoadingTeachers(true);
            try {
                const result = await getAllTeachersForSubjects();
                if (result.success && result.data) {
                    const opts: TeacherOption[] = result.data.map(t => ({
                        id: t.id, staffId: t.staffId, name: t.name, surname: t.surname,
                        email: t.email, role: t.role, displayName: `${t.name} ${t.surname}`,
                    }));
                    setTeachers(opts);
                    if (isEdit && subject?.teacherIds?.length) setSelectedTeacherStaffId(subject.teacherIds[0]);
                }
            } catch (e) { console.error('Error fetching teachers:', e); }
            finally { setLoadingTeachers(false); }
        };

        setIsClient(true);
        if (subject?.assessments) setAssessments(subject.assessments);
        if (subject?.schedule)    parseScheduleString(subject.schedule);
        if (subject?.className) {
            const parts = subject.className.split(' - ');
            if (parts.length > 1) {
                setClassName(parts[0]);
                const sec = parts[1].toLowerCase() as SectionValue;
                if (CLASS_SECTIONS.some(s => s.value === sec)) setClassSection(sec);
            } else {
                setClassName(subject.className);
                setClassSection((subject.classSection as SectionValue) ?? "primary");
            }
        }
        fetchTeachers();
    }, [subject, isEdit]);

    const parseScheduleString = (str: string) => {
        const slots: ScheduleSlot[] = [];
        str.split(';').filter(p => p.trim()).forEach(part => {
            const m = part.match(/(\w+)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*(Recurring)?/);
            if (m) slots.push({ day: m[1], startTime: m[2], endTime: m[3], recurring: !!m[4] });
        });
        setScheduleSlots(slots);
    };

    const formatScheduleString = (slots: ScheduleSlot[]) =>
        slots.map(s => `${s.day} ${s.startTime}-${s.endTime}${s.recurring ? ' Recurring' : ''}`).join('; ');

    const defaultSubject: Partial<Subject> = { id: 0, name: "", teacher: "", schedule: "", duration: "", topics: [], assessments: [] };
    const currentSubject   = subject || defaultSubject;
    const formTitle        = isEdit ? `Edit ${currentSubject.name}` : "Add New Subject";
    const submitButtonText = isEdit ? "Update Subject" : "Create Subject";

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const timeSlots: string[] = [];
    for (let h = 7; h <= 20; h++) for (let m = 0; m < 60; m += 30) timeSlots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);

    const getSelectedTeacherName = () => {
        const t = teachers.find(t => t.staffId === selectedTeacherStaffId);
        return t ? `${t.name} ${t.surname} (Role: ${t.role})` : "";
    };

    const addScheduleSlot = () => {
        if (newScheduleSlot.startTime && newScheduleSlot.endTime) {
            setScheduleSlots(p => [...p, { ...newScheduleSlot }]);
            setNewScheduleSlot({ day: "Monday", startTime: "09:00", endTime: "10:00", recurring: true });
        }
    };
    const removeScheduleSlot = (i: number) => setScheduleSlots(p => p.filter((_, idx) => idx !== i));

    const addAssessment = () => {
        if (newAssessment.type.trim() && newAssessment.date) {
            setAssessments(p => [...p, { ...newAssessment }]);
            setNewAssessment({ type: "", date: "" });
        } else alert("Please enter both assessment type and date");
    };
    const removeAssessment = (i: number) => setAssessments(p => p.filter((_, idx) => idx !== i));

    const handleClassNameChange = (name: string) => {
        setClassName(name);
        const m = name.match(/^(Grade \d{1,2})/);
        setPickerGrade(m ? m[1] : name ? "__custom__" : "");
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const formData = new FormData(e.currentTarget);
            const topics   = ((formData.get('topics') as string) || "").split(',').map(t => t.trim()).filter(Boolean);
            const schedule = formatScheduleString(scheduleSlots);

            if (!formData.get('name') || !selectedTeacherStaffId || !schedule || !formData.get('duration') || !className) {
                alert("Please fill in all required fields: Name, Teacher, Class Name, Schedule, and Duration");
                setIsSubmitting(false);
                return;
            }

            const teacher = teachers.find(t => t.staffId === selectedTeacherStaffId);
            if (!teacher) { alert("Please select a valid teacher"); setIsSubmitting(false); return; }

            const subjectName = (formData.get('name') as string).trim();

            if (!isEdit) {
                try {
                    const dup = await checkDuplicateSubject(subjectName, className, classSection);
                    if (dup.exists) {
                        alert("A subject with this name already exists for the same class and section.");
                        setIsSubmitting(false);
                        return;
                    }
                } catch {}
            }

            const data = {
                name: subjectName,
                teacher: `${teacher.name} ${teacher.surname}`,
                teacherIds: [teacher.staffId],
                teacherNames: [`${teacher.name} ${teacher.surname}`],
                schedule,
                duration: (formData.get('duration') as string).trim(),
                topics,
                assessments,
                className: className.trim(),
                classSection,
            };

            const result = isEdit && currentSubject.id
                ? await updateSubject(currentSubject.id, data as any)
                : await createSubject(data as any);

            if (result.success) { router.push("/academics/subjects"); router.refresh(); }
            else alert(result.error || "An error occurred while saving the subject");
        } catch (err) {
            console.error('Form submission error:', err);
            alert('An error occurred while saving the subject');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isClient) {
        return (
            <div className="grid grid-cols-1 gap-9">
                <ShowcaseSection title={formTitle} className="space-y-5.5 !p-6.5">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded"></div>)}
                    </div>
                </ShowcaseSection>
            </div>
        );
    }

    return (
        <>
            <Breadcrumb pageName={isEdit ? "Edit Subject" : "New Subject"} />
            <div className="grid grid-cols-1 gap-9">
                <div className="flex flex-col gap-9">
                    <ShowcaseSection title={formTitle} className="space-y-5.5 !p-6.5">
                        <form className="space-y-6" onSubmit={handleSubmit}>

                            {/* ── Basic Information ─────────────────────────── */}
                            <div className="border-b border-gray-200 pb-6">
                                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>

                                <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
                                    <InputGroup label="SUBJECT NAME *" name="name" type="text" placeholder="Enter subject name" defaultValue={currentSubject.name} className="w-full xl:w-1/2" required />
                                    <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">TEACHER *</label>
                                        <select name="teacher" value={selectedTeacherStaffId} onChange={(e) => setSelectedTeacherStaffId(e.target.value ? parseInt(e.target.value) : "")}
                                            className="w-full rounded border border-stroke bg-white py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white" required>
                                            <option value="">Select a teacher</option>
                                            {loadingTeachers
                                                ? <option disabled>Loading teachers...</option>
                                                : teachers.map(t => <option key={t.staffId} value={t.staffId}>{t.name} {t.surname} (Role: {t.role}) (Staff ID: {t.staffId})</option>)}
                                        </select>
                                        {selectedTeacherStaffId && (
                                            <p className="text-sm text-green-600 mt-1">✓ {getSelectedTeacherName()} (Staff ID: {selectedTeacherStaffId})</p>
                                        )}
                                    </div>
                                </div>

                                {/* Class Name Picker */}
                                <div className="mb-4.5">
                                    <ClassNamePicker
                                        value={className}
                                        classSection={classSection}
                                        onChange={handleClassNameChange}
                                        onSectionChange={setClassSection}
                                        onGradeChange={setPickerGrade}
                                    />
                                </div>

                                {/* Class Section Picker */}
                                <ClassSectionPicker value={classSection} onChange={setClassSection} selectedGrade={pickerGrade} />

                                {/* Duration */}
                                <div className="mb-4.5">
                                    <InputGroup label="DURATION PER SESSION *" name="duration" type="text" placeholder="e.g., 1 hour, 45 minutes" defaultValue={currentSubject.duration} className="w-full" required />
                                </div>
                            </div>

                            {/* ── Schedule ──────────────────────────────────── */}
                            <div className="border-b border-gray-200 pb-6">
                                <h3 className="text-lg font-semibold mb-4">Schedule</h3>
                                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                    <h4 className="text-sm font-semibold text-blue-800 mb-3">Add Schedule Slot</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                                            <select value={newScheduleSlot.day} onChange={(e) => setNewScheduleSlot(p => ({ ...p, day: e.target.value }))} className="w-full rounded border border-stroke bg-white py-2 px-3 text-black outline-none transition focus:border-primary">
                                                {daysOfWeek.map(d => <option key={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                            <select value={newScheduleSlot.startTime} onChange={(e) => setNewScheduleSlot(p => ({ ...p, startTime: e.target.value }))} className="w-full rounded border border-stroke bg-white py-2 px-3 text-black outline-none transition focus:border-primary">
                                                {timeSlots.map(t => <option key={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                            <select value={newScheduleSlot.endTime} onChange={(e) => setNewScheduleSlot(p => ({ ...p, endTime: e.target.value }))} className="w-full rounded border border-stroke bg-white py-2 px-3 text-black outline-none transition focus:border-primary">
                                                {timeSlots.map(t => <option key={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex items-end">
                                            <label className="flex items-center gap-2 cursor-pointer pb-2">
                                                <input type="checkbox" checked={newScheduleSlot.recurring} onChange={(e) => setNewScheduleSlot(p => ({ ...p, recurring: e.target.checked }))} className="rounded" />
                                                <span className="text-sm font-medium text-gray-700">Recurring</span>
                                            </label>
                                        </div>
                                        <div className="flex items-end">
                                            <button type="button" onClick={addScheduleSlot} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">+ Add Slot</button>
                                        </div>
                                    </div>
                                </div>
                                {scheduleSlots.length > 0 ? (
                                    <div className="space-y-2">
                                        {scheduleSlots.map((slot, i) => (
                                            <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">{slot.day}</span>
                                                    <span className="text-sm text-gray-600">{slot.startTime} – {slot.endTime}</span>
                                                    {slot.recurring && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">Recurring</span>}
                                                </div>
                                                <button type="button" onClick={() => removeScheduleSlot(i)} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500 text-sm">No schedule slots added yet.</div>
                                )}
                            </div>

                            {/* ── Course Topics ─────────────────────────────── */}
                            <div className="border-b border-gray-200 pb-6">
                                <h3 className="text-lg font-semibold mb-4">Course Topics</h3>
                                <label className="mb-2.5 block text-black dark:text-white">TOPICS (Comma separated)</label>
                                <textarea name="topics" rows={4} placeholder="Enter topics separated by commas, e.g., Algebra, Geometry, Calculus"
                                    defaultValue={currentSubject.topics?.join(', ') || ""}
                                    className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white" />
                                <p className="text-sm text-gray-500 mt-1">Separate multiple topics with commas.</p>
                            </div>

                            {/* ── Assessments ───────────────────────────────── */}
                            <div className="border-b border-gray-200 pb-6">
                                <h3 className="text-lg font-semibold mb-4">Assessments</h3>
                                <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                                    <h4 className="text-sm font-semibold text-yellow-800 mb-3">Add New Assessment</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Type</label>
                                            <input type="text" placeholder="e.g., Quiz 1, Midterm, Final Exam" value={newAssessment.type} onChange={(e) => setNewAssessment(p => ({ ...p, type: e.target.value }))} className="w-full rounded border border-stroke bg-white py-2 px-3 text-black outline-none transition focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                            <input type="date" value={newAssessment.date} onChange={(e) => setNewAssessment(p => ({ ...p, date: e.target.value }))} className="w-full rounded border border-stroke bg-white py-2 px-3 text-black outline-none transition focus:border-primary" />
                                        </div>
                                    </div>
                                    <button type="button" onClick={addAssessment} className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm">Add Assessment</button>
                                </div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Current Assessments ({assessments.length})</label>
                                {assessments.length > 0 ? (
                                    <div className="space-y-2">
                                        {assessments.map((a, i) => (
                                            <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-4">
                                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">{a.type}</span>
                                                    <span className="text-sm text-gray-600">{new Date(a.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                </div>
                                                <button type="button" onClick={() => removeAssessment(i)} className="text-red-600 hover:text-red-800 text-sm font-medium">Remove</button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 p-4 rounded-lg text-center"><p className="text-gray-500 text-sm">No assessments added yet.</p></div>
                                )}
                            </div>

                            {/* ── Calendar Integration ──────────────────────── */}
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-semibold text-purple-800 mb-1">Calendar Integration</h4>
                                        <p className="text-xs text-purple-700">This schedule will be visible on the collective calendar for all users to see.</p>
                                    </div>
                                    <Link href="/academics/calendar" className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm">View Calendar</Link>
                                </div>
                            </div>

                            {/* ── Action Buttons ────────────────────────────── */}
                            <div className="flex justify-end gap-4 pt-6">
                                <Link href="/academics/subjects" className="rounded-lg bg-gray-500 px-6 py-3 font-medium text-white hover:bg-gray-600 transition-colors">Cancel</Link>
                                <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {isEdit ? 'Updating...' : 'Creating...'}
                                        </span>
                                    ) : submitButtonText}
                                </button>
                            </div>

                        </form>
                    </ShowcaseSection>
                </div>
            </div>
        </>
    );
}