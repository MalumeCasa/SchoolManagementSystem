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

// Class section options
const CLASS_SECTIONS = [
    { value: "primary", label: "Primary" },
    { value: "secondary", label: "Secondary" },
    { value: "nursery", label: "Nursery" }
] as const;

export default function NewSubjectForm({ user, subject, isEdit = false }: NewSubjectFormProps & { user: any }) {
    const [isClient, setIsClient] = useState(false);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [newAssessment, setNewAssessment] = useState({ type: "", date: "" });
    const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
    const [newScheduleSlot, setNewScheduleSlot] = useState<ScheduleSlot>({
        day: "Monday",
        startTime: "09:00",
        endTime: "10:00",
        recurring: true
    });
    const [teachers, setTeachers] = useState<TeacherOption[]>([]);
    const [selectedTeacherStaffId, setSelectedTeacherStaffId] = useState<number | "">("");
    const [className, setClassName] = useState<string>("");
    const [classSection, setClassSection] = useState<string>("primary");
    const [loadingTeachers, setLoadingTeachers] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();


    useEffect(() => {
        const fetchTeachers = async () => {
            setLoadingTeachers(true);
            try {
                const result = await getAllTeachersForSubjects();
                if (result.success && result.data) {
                    const teacherOptions: TeacherOption[] = result.data.map(teacher => ({
                        id: teacher.id,
                        staffId: teacher.staffId,
                        name: teacher.name,
                        surname: teacher.surname,
                        email: teacher.email,
                        role: teacher.role,
                        displayName: `${teacher.name} ${teacher.surname}`
                    }));
                    setTeachers(teacherOptions);

                    // If editing and subject has teacherIds (which are staffIds), set the selected teacher
                    if (isEdit && subject?.teacherIds && subject.teacherIds.length > 0) {
                        setSelectedTeacherStaffId(subject.teacherIds[0]);
                    }
                }
            } catch (error) {
                console.error('Error fetching teachers:', error);
            } finally {
                setLoadingTeachers(false);
            }
        };

        setIsClient(true);
        if (subject?.assessments) {
            setAssessments(subject.assessments);
        }
        if (subject?.schedule) {
            parseScheduleString(subject.schedule);
        }
        // Initialize class name and section from subject data
        if (subject?.className) {
            // Extract class name and section from the stored className
            // Assuming format: "ClassName - Section" or just "ClassName"
            const classNameParts = subject.className.split(' - ');
            if (classNameParts.length > 1) {
                setClassName(classNameParts[0]);
                const section = classNameParts[1].toLowerCase();
                if (CLASS_SECTIONS.some(s => s.value === section)) {
                    setClassSection(section);
                }
            } else {
                setClassName(subject.className);
                // Default to primary if no section found
                setClassSection("primary");
            }
        }
        fetchTeachers();
    }, [subject, isEdit]); // Remove fetchTeachers from dependencies since it's defined inside
    
    const parseScheduleString = (scheduleString: string) => {
        const slots: ScheduleSlot[] = [];
        const parts = scheduleString.split(';').filter(part => part.trim());

        parts.forEach(part => {
            const match = part.match(/(\w+)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*(Recurring)?/);
            if (match) {
                slots.push({
                    day: match[1],
                    startTime: match[2],
                    endTime: match[3],
                    recurring: !!match[4]
                });
            }
        });

        setScheduleSlots(slots);
    };

    const formatScheduleString = (slots: ScheduleSlot[]): string => {
        return slots.map(slot =>
            `${slot.day} ${slot.startTime}-${slot.endTime}${slot.recurring ? ' Recurring' : ''}`
        ).join('; ');
    };

    const defaultSubject: Partial<Subject> = {
        id: 0,
        name: "",
        teacher: "",
        schedule: "",
        duration: "",
        topics: [],
        assessments: []
    };

    const currentSubject = subject || defaultSubject;
    const formTitle = isEdit ? `Edit ${currentSubject.name}` : "Add New Subject";
    const submitButtonText = isEdit ? "Update Subject" : "Create Subject";

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const timeSlots = [];
    for (let hour = 7; hour <= 20; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            timeSlots.push(timeString);
        }
    }

    const getSelectedTeacherName = () => {
        if (!selectedTeacherStaffId) return "";
        const teacher = teachers.find(t => t.staffId === selectedTeacherStaffId);
        return teacher ? `${teacher.name} ${teacher.surname} (Role: ${teacher.role})` : "";
    };

    const addScheduleSlot = () => {
        if (newScheduleSlot.startTime && newScheduleSlot.endTime) {
            setScheduleSlots(prev => [...prev, { ...newScheduleSlot }]);
            setNewScheduleSlot({
                day: "Monday",
                startTime: "09:00",
                endTime: "10:00",
                recurring: true
            });
        }
    };

    const removeScheduleSlot = (index: number) => {
        setScheduleSlots(prev => prev.filter((_, i) => i !== index));
    };

    const addAssessment = () => {
        if (newAssessment.type.trim() && newAssessment.date) {
            setAssessments(prev => [...prev, { ...newAssessment }]);
            setNewAssessment({ type: "", date: "" });
        } else {
            alert("Please enter both assessment type and date");
        }
    };

    const removeAssessment = (index: number) => {
        setAssessments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget);

            const topicsInput = formData.get('topics') as string;
            const topics = topicsInput
                ? topicsInput.split(',').map(t => t.trim()).filter(t => t.length > 0)
                : [];

            const schedule = formatScheduleString(scheduleSlots);

            // Validation
            if (!formData.get('name') || !selectedTeacherStaffId || !schedule || !formData.get('duration') || !className) {
                alert("Please fill in all required fields: Name, Teacher, Class Name, Schedule, and Duration");
                setIsSubmitting(false);
                return;
            }

            const selectedTeacher = teachers.find(t => t.staffId === selectedTeacherStaffId);
            if (!selectedTeacher) {
                alert("Please select a valid teacher");
                setIsSubmitting(false);
                return;
            }

            const subjectName = (formData.get('name') as string).trim();

            // Check for duplicates before submitting (only for new subjects)
            if (!isEdit) {
                try {
                    const duplicateCheck = await checkDuplicateSubject(subjectName, className, classSection);
                    if (duplicateCheck.exists) {
                        alert("A subject with this name already exists for the same class and section. Please use a different name or edit the existing subject.");
                        setIsSubmitting(false);
                        return;
                    }
                } catch (error) {
                    console.error('Error checking for duplicates:', error);
                    // Continue with submission if duplicate check fails
                }
            }

            // Create the subject data object with separate class name and section
            const subjectData = {
                name: subjectName,
                teacher: `${selectedTeacher.name} ${selectedTeacher.surname}`,
                teacherIds: [selectedTeacher.staffId],
                teacherNames: [`${selectedTeacher.name} ${selectedTeacher.surname}`],
                schedule: schedule,
                duration: (formData.get('duration') as string).trim(),
                topics: topics,
                assessments: assessments,
                className: className.trim(),
                classSection: classSection
            };

            let result;
            if (isEdit && currentSubject.id) {
                result = await updateSubject(currentSubject.id, subjectData as any);
            } else {
                result = await createSubject(subjectData as any);
            }

            if (result.success) {
                router.push("/academics/subjects");
                router.refresh();
            } else {
                alert(result.error || "An error occurred while saving the subject");
            }
        } catch (error) {
            console.error('Form submission error:', error);
            alert('An error occurred while saving the subject');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isClient) {
        return (
            <div className="grid grid-cols-1 gap-9 sm:grid-cols-1">
                <div className="flex flex-col gap-9">
                    <ShowcaseSection title={formTitle} className="space-y-5.5 !p-6.5">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                            <div className="space-y-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        </div>
                    </ShowcaseSection>
                </div>
            </div>
        );
    }

    return (
        <>
            <Breadcrumb pageName={isEdit ? "Edit Subject" : "New Subject"} />
            <div className="grid grid-cols-1 gap-9 sm:grid-cols-1">
                <div className="flex flex-col gap-9">
                    <ShowcaseSection title={formTitle} className="space-y-5.5 !p-6.5">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="border-b border-gray-200 pb-6">
                                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>

                                <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
                                    <InputGroup
                                        label="SUBJECT NAME *"
                                        name="name"
                                        type="text"
                                        placeholder="Enter subject name"
                                        defaultValue={currentSubject.name}
                                        className="w-full xl:w-1/2"
                                        required
                                    />
                                    <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            TEACHER *
                                        </label>
                                        <select
                                            name="teacher"
                                            value={selectedTeacherStaffId}
                                            onChange={(e) => setSelectedTeacherStaffId(e.target.value ? parseInt(e.target.value) : "")}
                                            className="w-full rounded border border-stroke bg-white py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            required
                                        >
                                            <option value="">Select a teacher</option>
                                            {loadingTeachers ? (
                                                <option disabled>Loading teachers...</option>
                                            ) : (
                                                teachers.map(teacher => (
                                                    <option key={teacher.staffId} value={teacher.staffId}>
                                                        {teacher.name} {teacher.surname} (Role: {teacher.role}) (Staff ID: {teacher.staffId})
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                        {selectedTeacherStaffId && (
                                            <p className="text-sm text-green-600 mt-1">
                                                Selected: {getSelectedTeacherName()} (Staff ID: {selectedTeacherStaffId})
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
                                    <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            CLASS NAME *
                                        </label>
                                        <input
                                            type="text"
                                            name="className"
                                            placeholder="e.g., Grade 10, Class A, Mathematics Group"
                                            value={className}
                                            onChange={(e) => setClassName(e.target.value)}
                                            className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                            required
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Enter the class or grade level for this subject
                                        </p>
                                    </div>
                                    <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            CLASS SECTION *
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {CLASS_SECTIONS.map((section) => (
                                                <label
                                                    key={section.value}
                                                    className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${classSection === section.value
                                                        ? 'bg-primary border-primary text-white'
                                                        : 'bg-white border-stroke text-black hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="classSection"
                                                        value={section.value}
                                                        checked={classSection === section.value}
                                                        onChange={(e) => setClassSection(e.target.value)}
                                                        className="sr-only"
                                                    />
                                                    <span className="text-sm font-medium">{section.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Select the educational section
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-4.5">
                                    <InputGroup
                                        label="DURATION PER SESSION *"
                                        name="duration"
                                        type="text"
                                        placeholder="e.g., 1 hour, 45 minutes"
                                        defaultValue={currentSubject.duration}
                                        className="w-full"
                                        required
                                    />
                                </div>

                                {/* Class Preview */}
                                {className && (
                                    <div className="bg-blue-50 p-3 rounded-lg mt-4">
                                        <h4 className="text-sm font-semibold text-blue-800 mb-1">Class Preview:</h4>
                                        <p className="text-sm text-blue-700 font-medium">
                                            Class Name: <strong>{className}</strong>
                                        </p>
                                        <p className="text-sm text-blue-700 font-medium">
                                            Section: <strong>{classSection.charAt(0).toUpperCase() + classSection.slice(1)}</strong>
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">
                                            These will be stored separately in the database
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Schedule Section */}
                            <div className="border-b border-gray-200 pb-6">
                                <h3 className="text-lg font-semibold mb-4">Schedule</h3>

                                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                    <h4 className="text-sm font-semibold text-blue-800 mb-3">Add Schedule Slot</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Day
                                            </label>
                                            <select
                                                value={newScheduleSlot.day}
                                                onChange={(e) => setNewScheduleSlot(prev => ({ ...prev, day: e.target.value }))}
                                                className="w-full rounded border border-stroke bg-white py-2 px-3 text-black outline-none transition focus:border-primary"
                                            >
                                                {daysOfWeek.map(day => (
                                                    <option key={day} value={day}>{day}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Start Time
                                            </label>
                                            <select
                                                value={newScheduleSlot.startTime}
                                                onChange={(e) => setNewScheduleSlot(prev => ({ ...prev, startTime: e.target.value }))}
                                                className="w-full rounded border border-stroke bg-white py-2 px-3 text-black outline-none transition focus:border-primary"
                                            >
                                                {timeSlots.map(time => (
                                                    <option key={time} value={time}>{time}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                End Time
                                            </label>
                                            <select
                                                value={newScheduleSlot.endTime}
                                                onChange={(e) => setNewScheduleSlot(prev => ({ ...prev, endTime: e.target.value }))}
                                                className="w-full rounded border border-stroke bg-white py-2 px-3 text-black outline-none transition focus:border-primary"
                                            >
                                                {timeSlots.map(time => (
                                                    <option key={time} value={time}>{time}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-end">
                                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                                <input
                                                    type="checkbox"
                                                    checked={newScheduleSlot.recurring}
                                                    onChange={(e) => setNewScheduleSlot(prev => ({ ...prev, recurring: e.target.checked }))}
                                                    className="rounded border-gray-300"
                                                />
                                                Recurring
                                            </label>
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                onClick={addScheduleSlot}
                                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                            >
                                                Add Slot
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Schedule ({scheduleSlots.length} slots)
                                    </label>

                                    {scheduleSlots.length > 0 ? (
                                        <div className="space-y-2">
                                            {scheduleSlots.map((slot, index) => (
                                                <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                                    <div className="flex items-center gap-4">
                                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                            {slot.day}
                                                        </span>
                                                        <span className="text-sm text-gray-600">
                                                            {slot.startTime} - {slot.endTime}
                                                        </span>
                                                        {slot.recurring && (
                                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                                                Recurring
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeScheduleSlot(index)}
                                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                                            <p className="text-gray-500 text-sm">No schedule slots added yet.</p>
                                        </div>
                                    )}
                                </div>

                                {scheduleSlots.length > 0 && (
                                    <div className="bg-green-50 p-4 rounded-lg mt-4">
                                        <h4 className="text-sm font-semibold text-green-800 mb-2">Schedule Preview:</h4>
                                        <p className="text-sm text-green-700">
                                            {formatScheduleString(scheduleSlots)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Topics Section */}
                            <div className="border-b border-gray-200 pb-6">
                                <h3 className="text-lg font-semibold mb-4">Course Topics</h3>

                                <div className="mb-4.5">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        TOPICS (Comma separated)
                                    </label>
                                    <textarea
                                        name="topics"
                                        placeholder="Enter topics separated by commas, e.g., Algebra, Geometry, Calculus, Statistics"
                                        defaultValue={currentSubject.topics?.join(', ') || ""}
                                        rows={4}
                                        className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Separate multiple topics with commas. These will be the main units covered in this subject.
                                    </p>
                                </div>
                            </div>

                            {/* Assessments Section */}
                            <div className="border-b border-gray-200 pb-6">
                                <h3 className="text-lg font-semibold mb-4">Assessments</h3>

                                <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                                    <h4 className="text-sm font-semibold text-yellow-800 mb-3">Add New Assessment</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Assessment Type
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Quiz 1, Midterm, Final Exam, Project"
                                                value={newAssessment.type}
                                                onChange={(e) => setNewAssessment(prev => ({ ...prev, type: e.target.value }))}
                                                className="w-full rounded border border-stroke bg-white py-2 px-3 text-black outline-none transition focus:border-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Date
                                            </label>
                                            <input
                                                type="date"
                                                value={newAssessment.date}
                                                onChange={(e) => setNewAssessment(prev => ({ ...prev, date: e.target.value }))}
                                                className="w-full rounded border border-stroke bg-white py-2 px-3 text-black outline-none transition focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addAssessment}
                                        className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm"
                                    >
                                        Add Assessment
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Assessments ({assessments.length})
                                    </label>

                                    {assessments.length > 0 ? (
                                        <div className="space-y-2">
                                            {assessments.map((assessment, index) => (
                                                <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                                    <div className="flex items-center gap-4">
                                                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                                            {assessment.type}
                                                        </span>
                                                        <span className="text-sm text-gray-600">
                                                            {new Date(assessment.date).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAssessment(index)}
                                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                                            <p className="text-gray-500 text-sm">No assessments added yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Calendar Link */}
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-semibold text-purple-800 mb-1">Calendar Integration</h4>
                                        <p className="text-xs text-purple-700">
                                            This schedule will be visible on the collective calendar for all users to see.
                                        </p>
                                    </div>
                                    <Link
                                        href="/academics/calendar"
                                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                                    >
                                        View Calendar
                                    </Link>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-4 pt-6">
                                <Link
                                    href="/academics/subjects"
                                    className="rounded-lg bg-gray-500 px-6 py-3 font-medium text-white hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {isEdit ? 'Updating...' : 'Creating...'}
                                        </span>
                                    ) : (
                                        submitButtonText
                                    )}
                                </button>
                            </div>
                        </form>
                    </ShowcaseSection>
                </div>
            </div>
        </>
    );
}