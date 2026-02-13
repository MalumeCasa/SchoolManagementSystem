"use client";

import React, { useState, useEffect } from "react";
import type { Subject } from "@api/db/types";
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    Users,
    BookOpen,
    RefreshCw,
    Grid,
    List,
    Eye,
    MoreVertical,
    X
} from "lucide-react";

interface CalendarProps {
    subjects: Subject[];
}

interface CalendarEvent {
    id: string;
    title: string;
    teacher: string;
    day: string;
    startTime: string;
    endTime: string;
    recurring: boolean;
    subjectId: number;
    color: string;
    className: string;
}

// Time slots for the calendar (7 AM to 8 PM)
const timeSlots: string[] = [];
for (let hour = 7; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 60) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        timeSlots.push(timeString);
    }
}

export default function Calendar({ subjects }: CalendarProps) {
    const [isClient, setIsClient] = useState(false);
    const [selectedView, setSelectedView] = useState<'week' | 'month' | 'list'>('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [activeDay, setActiveDay] = useState<string | null>(null);

    // Fix hydration by only rendering on client
    useEffect(() => {
        setIsClient(true);
        parseSubjectsToEvents(subjects);
    }, [subjects]);

    // Parse subjects into calendar events
    const parseSubjectsToEvents = (subjectsData: Subject[]) => {
        const colors = [
            'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300',
            'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300',
            'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300',
            'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-300',
            'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300',
            'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300',
            'bg-indigo-100 border-indigo-300 text-indigo-800 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-300',
        ];

        const eventsList: CalendarEvent[] = [];

        subjectsData.forEach((subject, index) => {
            if (subject.schedule) {
                const scheduleParts = subject.schedule.split(';').filter(part => part.trim());

                scheduleParts.forEach(part => {
                    const match = part.match(/(\w+)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*(Recurring)?/);
                    if (match) {
                        eventsList.push({
                            id: `${subject.id}-${match[1]}-${match[2]}`,
                            title: subject.name,
                            teacher: subject.teacher,
                            day: match[1],
                            startTime: match[2],
                            endTime: match[3],
                            recurring: !!match[4],
                            subjectId: subject.id,
                            color: colors[index % colors.length],
                            className: subject.className || 'Not assigned'
                        });
                    }
                });
            }
        });

        setEvents(eventsList);
    };

    // Get days of the week
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    // Group events by day
    const eventsByDay = daysOfWeek.reduce((acc, day) => {
        acc[day] = events.filter(event => event.day === day);
        return acc;
    }, {} as Record<string, CalendarEvent[]>);

    // Sort events by start time
    Object.keys(eventsByDay).forEach(day => {
        eventsByDay[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    // Navigation
    const goToPreviousWeek = () => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() - 7);
            return newDate;
        });
    };

    const goToNextWeek = () => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + 7);
            return newDate;
        });
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Get week range for display
    const getWeekRange = () => {
        const start = new Date(currentDate);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        return {
            start: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            end: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
    };

    const weekRange = getWeekRange();

    // Handle event click
    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setShowEventModal(true);
    };

    // Get events for list view
    const getEventsForList = () => {
        return events.sort((a, b) => {
            const dayComparison = daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
            if (dayComparison !== 0) return dayComparison;
            return a.startTime.localeCompare(b.startTime);
        });
    };

    // Don't render until client-side to avoid hydration mismatch
    if (!isClient) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="space-y-4">
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="h-20 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Calendar Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Week of {weekRange.start} - {weekRange.end}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={goToPreviousWeek}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={goToToday}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span className="hidden sm:inline">Today</span>
                    </button>
                    <button
                        onClick={goToNextWeek}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setSelectedView('week')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${selectedView === 'week'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                >
                    <Grid className="w-4 h-4" />
                    <span className="hidden sm:inline">Week</span>
                </button>
                <button
                    onClick={() => setSelectedView('month')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${selectedView === 'month'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                >
                    <CalendarIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Month</span>
                </button>
                <button
                    onClick={() => setSelectedView('list')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${selectedView === 'list'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                >
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline">List</span>
                </button>
            </div>

            {/* Week View Calendar */}
            {selectedView === 'week' && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
                    {/* Mobile Day Selector */}
                    <div className="lg:hidden flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                        {daysOfWeek.map(day => (
                            <button
                                key={day}
                                onClick={() => setActiveDay(activeDay === day ? null : day)}
                                className={`flex-1 min-w-20 px-3 py-3 text-sm font-medium border-r border-gray-200 dark:border-gray-700 last:border-r-0 transition-colors ${activeDay === day
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {day.slice(0, 3)}
                            </button>
                        ))}
                    </div>

                    {/* Header - Hidden on mobile when day is selected */}
                    <div className={`bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 ${activeDay ? 'hidden lg:grid' : 'grid'}`}>
                        <div className="grid grid-cols-8">
                            <div className="p-3 sm:p-4 border-r border-gray-200 dark:border-gray-700 font-medium text-gray-600 dark:text-gray-400 text-sm">
                                Time
                            </div>
                            {daysOfWeek.map(day => (
                                <div
                                    key={day}
                                    className="p-3 sm:p-4 text-center font-medium text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 last:border-r-0 text-sm"
                                >
                                    <div className="hidden sm:block">{day}</div>
                                    <div className="sm:hidden">{day.slice(0, 3)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Time Slots */}
                    <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                        {timeSlots.map(timeSlot => (
                            <div key={timeSlot} className="grid grid-cols-8">
                                <div className="p-2 sm:p-3 border-r border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
                                    {timeSlot}
                                </div>
                                {daysOfWeek.map(day => (
                                    <div
                                        key={day}
                                        className={`p-1 border-r border-gray-200 dark:border-gray-700 min-h-12 sm:min-h-16 last:border-r-0 relative ${activeDay && activeDay !== day ? 'hidden lg:block' : 'block'
                                            }`}
                                    >
                                        {eventsByDay[day]
                                            .filter(event => event.startTime === timeSlot)
                                            .map(event => (
                                                <div
                                                    key={event.id}
                                                    onClick={() => handleEventClick(event)}
                                                    className={`p-2 rounded border ${event.color} text-xs mb-1 cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105`}
                                                >
                                                    <div className="font-medium truncate">{event.title}</div>
                                                    <div className="text-gray-600 dark:text-gray-400 truncate">
                                                        {event.teacher}
                                                    </div>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                                                            {event.startTime}
                                                        </div>
                                                        <div className="text-xs font-semibold bg-white dark:bg-gray-800 px-1 rounded border">
                                                            {event.className}
                                                        </div>
                                                    </div>
                                                    {event.recurring && (
                                                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs mt-1">
                                                            <RefreshCw className="w-3 h-3" />
                                                            <span>Recurring</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* List View */}
            {selectedView === 'list' && (
                <div className="space-y-3">
                    {getEventsForList().map(event => (
                        <div
                            key={event.id}
                            onClick={() => handleEventClick(event)}
                            className={`p-4 rounded-xl border ${event.color} cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105`}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {event.title}
                                        </h3>
                                        {event.recurring && (
                                            <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            <span>{event.teacher}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-4 h-4" />
                                            <span>{event.className}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <span>{event.day} • {event.startTime} - {event.endTime}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Month View */}
            {selectedView === 'month' && (
                <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <CalendarIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Month View Coming Soon
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        We&apos;re working on an enhanced month view with better visualization of your schedule across the entire month.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => setSelectedView('week')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                        >
                            <Grid className="w-4 h-4" />
                            Switch to Week View
                        </button>
                        <button
                            onClick={() => setSelectedView('list')}
                            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex items-center gap-2"
                        >
                            <List className="w-4 h-4" />
                            List View
                        </button>
                    </div>
                </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{subjects.length}</div>
                            <div className="text-sm text-blue-600 dark:text-blue-400">Total Subjects</div>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-lg">
                            <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{events.length}</div>
                            <div className="text-sm text-green-600 dark:text-green-400">Scheduled Classes</div>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-800/30 rounded-lg">
                            <RefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                {events.filter(e => e.recurring).length}
                            </div>
                            <div className="text-sm text-purple-600 dark:text-purple-400">Recurring</div>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-800/30 rounded-lg">
                            <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                                {new Set(events.map(e => e.className)).size}
                            </div>
                            <div className="text-sm text-orange-600 dark:text-orange-400">Classes</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Modal */}
            {showEventModal && selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Class Details
                            </h3>
                            <button
                                onClick={() => setShowEventModal(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Subject</label>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedEvent.title}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Teacher</label>
                                    <p className="text-gray-900 dark:text-white">{selectedEvent.teacher}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Class</label>
                                    <p className="text-gray-900 dark:text-white">{selectedEvent.className}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Day</label>
                                    <p className="text-gray-900 dark:text-white">{selectedEvent.day}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Time</label>
                                    <p className="text-gray-900 dark:text-white">{selectedEvent.startTime} - {selectedEvent.endTime}</p>
                                </div>
                            </div>

                            {selectedEvent.recurring && (
                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                    <RefreshCw className="w-4 h-4" />
                                    <span className="text-sm font-medium">Recurring Class</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowEventModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}