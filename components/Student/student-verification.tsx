'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    getRegisteredStudents,
    registerStudent
} from '@api/student-actions'

// ─── Types ────────────────────────────────────────────────────────────────────

type StudentStatus = 'pending' | 'active' | 'inactive' | 'suspended'

import {Student } from '@api/db/types'


type TabKey = 'all' | 'pending' | 'active' | 'inactive' | 'suspended'
type ToastType = 'success' | 'error' | 'info'

interface Toast {
    id: string
    type: ToastType
    title: string
    message: string
}

// ─── Helper functions ─────────────────────────────────────────────────────────

function getInitials(name?: string, surname?: string): string {
    return `${(name?.[0] ?? '').toUpperCase()}${(surname?.[0] ?? '').toUpperCase()}`
}

function formatDate(dateStr?: string): string {
    if (!dateStr) return '—'
    try {
        return new Intl.DateTimeFormat('en-ZA', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(new Date(dateStr))
    } catch {
        return dateStr
    }
}

// ─── Status Badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: StudentStatus }) {
    const config: Record<StudentStatus, { label: string; className: string }> = {
        pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
        active: { label: 'Active', className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
        inactive: { label: 'Inactive', className: 'bg-gray-50 text-gray-600 ring-1 ring-gray-200' },
        suspended: { label: 'Suspended', className: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' },
    }

    const c = config[status] ?? config.inactive

    return (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${c.className}`}>
            {c.label}
        </span>
    )
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`
                        flex items-start gap-3 p-4 rounded-lg shadow-lg
                        ${t.type === 'success' ? 'bg-emerald-50' : ''}
                        ${t.type === 'error' ? 'bg-rose-50' : ''}
                        ${t.type === 'info' ? 'bg-blue-50' : ''}
                    `}
                >
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{t.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{t.message}</p>
                    </div>
                    <button
                        onClick={() => onDismiss(t.id)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    )
}

// ─── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">{label}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    )
}

// ─── Student Row ────────────────────────────────────────────────────────────

function StudentRow({
    student,
    onStatusChange,
    onSelect,
    onView,
    isSelected,
    loading,
}: {
    student: Student
    onStatusChange: (idNumber: string, status: StudentStatus) => void
    onSelect: (id: number) => void
    onView: (student: Student) => void
    isSelected: boolean
    loading: boolean
}) {
    return (
        <tr
            className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => onView(student)}
        >
            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(student.id)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-indigo-700">
                            {getInitials(student.name, student.surname)}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">
                            {student.surname}, {student.name}
                        </p>
                        {student.preferredName && (
                            <p className="text-xs text-gray-500">"{student.preferredName}"</p>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">{student.idNumber}</td>
            <td className="px-4 py-3 text-sm text-gray-600">{student.email || '—'}</td>
            <td className="px-4 py-3 text-sm text-gray-600">{student.phone || '—'}</td>
            <td className="px-4 py-3">
                <StatusBadge status={student.status} />
            </td>
            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                    <select
                        value={student.status}
                        onChange={(e) => onStatusChange(student.idNumber, e.target.value as StudentStatus)}
                        disabled={loading}
                        className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
            </td>
        </tr>
    )
}

// ─── Student Detail Modal ───────────────────────────────────────────────────

function StudentModal({ student, onClose, onStatusChange, loading }: {
    student: Student | null
    onClose: () => void
    onStatusChange: (idNumber: string, status: StudentStatus) => void
    loading: boolean
}) {
    if (!student) return null

    return (
        <>
            <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
            <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Student Profile</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-xl font-medium text-indigo-700">
                                    {getInitials(student.name, student.surname)}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">{student.name} {student.surname}</h3>
                                {student.preferredName && (
                                    <p className="text-sm text-gray-500">Known as "{student.preferredName}"</p>
                                )}
                                <div className="mt-2">
                                    <StatusBadge status={student.status} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
                                <select
                                    value={student.status}
                                    onChange={(e) => onStatusChange(student.idNumber, e.target.value as StudentStatus)}
                                    disabled={loading}
                                    className="mt-1 block w-full text-sm border border-gray-200 rounded-md px-3 py-2"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500">ID Number</label>
                                    <p className="text-sm text-gray-900">{student.idNumber}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Date of Birth</label>
                                    <p className="text-sm text-gray-900">{formatDate(student.dateOfBirth)}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Email</label>
                                    <p className="text-sm text-gray-900">{student.email || '—'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Phone</label>
                                    <p className="text-sm text-gray-900">{student.phone || '—'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Enrolment Date</label>
                                    <p className="text-sm text-gray-900">{formatDate(student.dateOfEnrolment)}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Religion</label>
                                    <p className="text-sm text-gray-900">{student.religion || '—'}</p>
                                </div>
                            </div>

                            {(student.motherFirstNames || student.fatherFirstNames) && (
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                                        Parent/Guardian
                                    </label>
                                    <div className="space-y-3">
                                        {student.motherFirstNames && (
                                            <div className="bg-gray-50 p-3 rounded-md">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {student.motherFirstNames} {student.motherSurname}
                                                </p>
                                                {student.motherCell && (
                                                    <p className="text-xs text-gray-600 mt-1">{student.motherCell}</p>
                                                )}
                                            </div>
                                        )}
                                        {student.fatherFirstNames && (
                                            <div className="bg-gray-50 p-3 rounded-md">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {student.fatherFirstNames} {student.fatherSurname}
                                                </p>
                                                {student.fatherCell && (
                                                    <p className="text-xs text-gray-600 mt-1">{student.fatherCell}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

// ─── Confirm Modal ──────────────────────────────────────────────────────────

function ConfirmModal({ count, onConfirm, onCancel, loading }: {
    count: number;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean
}) {
    return (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Approve All Pending Students</h3>
                <p className="text-sm text-gray-600 mb-6">
                    You are about to approve <span className="font-medium">{count} student{count !== 1 ? 's' : ''}</span>.
                    This will change their status to Active.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? 'Approving...' : `Approve ${count}`}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Helper function to create FormData from student data ──────────────────

function createStudentFormData(student: Student, status: StudentStatus): FormData {
    const formData = new FormData()
    
    // Required fields
    formData.append('idNumber', student.idNumber)
    formData.append('name', student.name)
    formData.append('surname', student.surname)
    formData.append('status', status)
    
    // Optional fields - only append if they exist and are not empty
    if (student.preferredName?.trim()) formData.append('preferredName', student.preferredName)
    if (student.email?.trim()) formData.append('email', student.email)
    if (student.phone?.trim()) formData.append('phone', student.phone)
    if (student.sex?.trim()) formData.append('sex', student.sex)
    if (student.dateOfBirth?.trim()) formData.append('dateOfBirth', student.dateOfBirth)
    if (student.religion?.trim()) formData.append('religion', student.religion)
    if (student.careRequired?.trim()) formData.append('careRequired', student.careRequired)
    if (student.dateOfEnrolment?.trim()) formData.append('dateOfEnrolment', student.dateOfEnrolment)
    if (student.address?.trim()) formData.append('address', student.address)
    
    // Handle arrays
    if (student.homeLanguage?.length) {
        formData.append('homeLanguage', student.homeLanguage.join(','))
    }
    
    // Parent information - Mother
    if (student.motherFirstNames?.trim()) {
        formData.append('motherFirstNames', student.motherFirstNames)
        if (student.motherSurname?.trim()) formData.append('motherSurname', student.motherSurname)
        if (student.motherCell?.trim()) formData.append('motherCell', student.motherCell)
        if (student.motherEmail?.trim()) formData.append('motherEmail', student.motherEmail)
    }
    
    // Parent information - Father
    if (student.fatherFirstNames?.trim()) {
        formData.append('fatherFirstNames', student.fatherFirstNames)
        if (student.fatherSurname?.trim()) formData.append('fatherSurname', student.fatherSurname)
        if (student.fatherCell?.trim()) formData.append('fatherCell', student.fatherCell)
    }
    
    return formData
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function StudentVerificationPage() {
    const [students, setStudents] = useState<Student[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<TabKey>('pending')
    const [search, setSearch] = useState('')
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
    const [actionLoadingIds, setActionLoadingIds] = useState<Set<string>>(new Set())
    const [toasts, setToasts] = useState<Toast[]>([])
    const [modalStudent, setModalStudent] = useState<Student | null>(null)
    const [showApproveAllModal, setShowApproveAllModal] = useState(false)
    const [bulkLoading, setBulkLoading] = useState(false)

    // Toast helpers
    const addToast = useCallback((type: ToastType, title: string, message: string) => {
        const id = `${Date.now()}-${Math.random()}`
        setToasts(prev => [...prev, { id, type, title, message }])
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
    }, [])

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    // Load students
    const loadStudents = useCallback(async () => {
        setIsLoading(true)
        try {
            const data = await getRegisteredStudents()
            setStudents((data as any[]).map(s => ({
                id: s.id,
                idNumber: s.idNumber ?? '',
                name: s.name ?? '',
                surname: s.surname ?? '',
                preferredName: s.preferredName,
                email: s.email,
                phone: s.phone,
                sex: s.sex,
                dateOfBirth: s.dateOfBirth,
                religion: s.religion,
                careRequired: s.careRequired,
                dateOfEnrolment: s.dateOfEnrolment,
                homeLanguage: Array.isArray(s.homeLanguage) ? s.homeLanguage : s.homeLanguage ? [s.homeLanguage] : [],
                status: (s.status as StudentStatus) ?? 'pending',
                createdAt: s.createdAt,
                updatedAt: s.updatedAt,
                motherFirstNames: s.motherFirstNames,
                motherSurname: s.motherSurname,
                motherCell: s.motherCell,
                motherEmail: s.motherEmail,
                fatherFirstNames: s.fatherFirstNames,
                fatherSurname: s.fatherSurname,
                fatherCell: s.fatherCell,
            })))
        } catch (err) {
            addToast('error', 'Failed to load', 'Could not fetch student records.')
        } finally {
            setIsLoading(false)
        }
    }, [addToast])

    useEffect(() => { loadStudents() }, [loadStudents])

    // Derived data
    const pendingStudents = students.filter(s => s.status === 'pending')
    const activeStudents = students.filter(s => s.status === 'active')
    const inactiveStudents = students.filter(s => s.status === 'inactive')
    const suspendedStudents = students.filter(s => s.status === 'suspended')

    const tabStudents = {
        all: students,
        pending: pendingStudents,
        active: activeStudents,
        inactive: inactiveStudents,
        suspended: suspendedStudents,
    }[activeTab]

    const filteredStudents = tabStudents.filter(s => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return (
            s.name?.toLowerCase().includes(q) ||
            s.surname?.toLowerCase().includes(q) ||
            s.idNumber?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q)
        )
    })

    const selectedPending = filteredStudents.filter(s => selectedIds.has(s.id) && s.status === 'pending')

    // Status change - using registerStudent which handles both create and update
    const handleStatusChange = useCallback(async (idNumber: string, newStatus: StudentStatus) => {
        setActionLoadingIds(prev => new Set(prev).add(idNumber))

        // Find the current student data
        const currentStudent = students.find(s => s.idNumber === idNumber)
        if (!currentStudent) {
            setActionLoadingIds(prev => {
                const next = new Set(prev);
                next.delete(idNumber);
                return next
            })
            return
        }

        // Store original status for rollback
        const originalStatus = currentStudent.status

        // Optimistic update
        setStudents(prev => prev.map(s => s.idNumber === idNumber ? { ...s, status: newStatus } : s))
        if (modalStudent?.idNumber === idNumber) {
            setModalStudent(prev => prev ? { ...prev, status: newStatus } : prev)
        }

        try {
            // Create FormData with all student data and new status
            const formData = createStudentFormData(currentStudent, newStatus)

            // Call registerStudent which will update the existing student
            const result = await registerStudent(formData)

            if (result.success) {
                const name = `${currentStudent.name} ${currentStudent.surname}`
                addToast('success', 'Status Updated', `${name} is now ${newStatus}.`)
            } else {
                // Rollback on failure
                setStudents(prev => prev.map(s => s.idNumber === idNumber ? { ...s, status: originalStatus } : s))
                if (modalStudent?.idNumber === idNumber) {
                    setModalStudent(prev => prev ? { ...prev, status: originalStatus } : prev)
                }
                addToast('error', 'Update Failed', result.error || 'Something went wrong.')
                console.error('Status update failed:', result.error)
            }
        } catch (error) {
            // Rollback on exception
            setStudents(prev => prev.map(s => s.idNumber === idNumber ? { ...s, status: originalStatus } : s))
            if (modalStudent?.idNumber === idNumber) {
                setModalStudent(prev => prev ? { ...prev, status: originalStatus } : prev)
            }
            addToast('error', 'Update Failed', 'An unexpected error occurred.')
            console.error('Status change error:', error)
        } finally {
            setActionLoadingIds(prev => {
                const next = new Set(prev);
                next.delete(idNumber);
                return next
            })
        }
    }, [students, modalStudent, addToast])

    // Bulk approve - using registerStudent for each student
    const handleBulkApprove = useCallback(async () => {
        if (selectedPending.length === 0) return
        
        setBulkLoading(true)
        let success = 0
        let failed = 0
        const failedStudents: string[] = []

        for (const s of selectedPending) {
            try {
                // Create FormData with all student data and active status
                const formData = createStudentFormData(s, 'active')
                
                const result = await registerStudent(formData)

                if (result.success) {
                    success++
                    setStudents(prev => prev.map(st => 
                        st.idNumber === s.idNumber ? { ...st, status: 'active' } : st
                    ))
                } else {
                    failed++
                    failedStudents.push(`${s.name} ${s.surname}`)
                    console.error(`Failed to approve student ${s.idNumber}:`, result.error)
                }
            } catch (error) {
                failed++
                failedStudents.push(`${s.name} ${s.surname}`)
                console.error(`Error approving student ${s.idNumber}:`, error)
            }
        }

        setSelectedIds(new Set())
        setBulkLoading(false)

        if (success > 0) {
            addToast('success', 'Bulk Approved', `${success} student${success !== 1 ? 's' : ''} approved.`)
        }
        if (failed > 0) {
            addToast('error', 'Some Failed', `${failed} student${failed !== 1 ? 's' : ''} could not be approved: ${failedStudents.join(', ')}`)
        }
    }, [selectedPending, addToast])

    // Approve ALL pending - using registerStudent for each student
    const handleApproveAll = useCallback(async () => {
        if (pendingStudents.length === 0) return
        
        setBulkLoading(true)
        setShowApproveAllModal(false)
        
        let success = 0
        let failed = 0
        const failedStudents: string[] = []

        for (const s of pendingStudents) {
            try {
                const formData = createStudentFormData(s, 'active')
                const result = await registerStudent(formData)

                if (result.success) {
                    success++
                    setStudents(prev => prev.map(st => 
                        st.idNumber === s.idNumber ? { ...st, status: 'active' } : st
                    ))
                } else {
                    failed++
                    failedStudents.push(`${s.name} ${s.surname}`)
                    console.error(`Failed to approve student ${s.idNumber}:`, result.error)
                }
            } catch (error) {
                failed++
                failedStudents.push(`${s.name} ${s.surname}`)
                console.error(`Error approving student ${s.idNumber}:`, error)
            }
        }

        setBulkLoading(false)

        if (success > 0) {
            addToast('success', 'All Approved!', `${success} student${success !== 1 ? 's' : ''} activated.`)
        }
        if (failed > 0) {
            addToast('error', 'Some Failed', `${failed} student${failed !== 1 ? 's' : ''} could not be approved: ${failedStudents.join(', ')}`)
        }
    }, [pendingStudents, addToast])

    // Bulk select
    const toggleSelect = useCallback((id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }, [])

    const toggleSelectAll = useCallback(() => {
        if (selectedIds.size === filteredStudents.length && filteredStudents.length > 0) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(filteredStudents.map(s => s.id)))
        }
    }, [selectedIds.size, filteredStudents])

    // Tab configuration for easy mapping
    const tabs = [
        { key: 'pending' as TabKey, label: 'Pending', count: pendingStudents.length, color: 'amber' },
        { key: 'active' as TabKey, label: 'Active', count: activeStudents.length, color: 'emerald' },
        { key: 'inactive' as TabKey, label: 'Inactive', count: inactiveStudents.length, color: 'gray' },
        { key: 'suspended' as TabKey, label: 'Suspended', count: suspendedStudents.length, color: 'rose' },
        { key: 'all' as TabKey, label: 'All Students', count: students.length, color: 'indigo' },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900">Student Verification</h1>
                    <p className="text-sm text-gray-500 mt-1">Review and manage student registrations</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <StatCard label="Total Students" value={students.length} sub="All records" />
                    <StatCard label="Pending" value={pendingStudents.length} sub="Awaiting review" />
                    <StatCard label="Active" value={activeStudents.length} sub="Approved" />
                    <StatCard label="Inactive" value={inactiveStudents.length} sub="Not active" />
                    <StatCard label="Suspended" value={suspendedStudents.length} sub="Suspended" />
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2 flex-wrap">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => {
                                    setActiveTab(tab.key)
                                    setSelectedIds(new Set())
                                }}
                                className={`
                                    px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors
                                    ${activeTab === tab.key
                                        ? `bg-${tab.color}-50 text-${tab.color}-700`
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }
                                `}
                            >
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                        activeTab === tab.key
                                            ? `bg-${tab.color}-100 text-${tab.color}-700`
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="px-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />

                        {selectedPending.length > 0 && (
                            <button
                                onClick={handleBulkApprove}
                                disabled={bulkLoading}
                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                                {bulkLoading ? 'Processing...' : `Approve ${selectedPending.length} Selected`}
                            </button>
                        )}

                        {pendingStudents.length > 0 && (
                            <button
                                onClick={() => setShowApproveAllModal(true)}
                                disabled={bulkLoading}
                                className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                            >
                                Approve All ({pendingStudents.length})
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left w-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.size === filteredStudents.length && filteredStudents.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Number</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <tr key={i} className="border-b border-gray-100">
                                            {Array.from({ length: 7 }).map((_, j) => (
                                                <td key={j} className="px-4 py-3">
                                                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                                            {search ? 'No students match your search' : `No ${activeTab} students found`}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map(student => (
                                        <StudentRow
                                            key={student.id}
                                            student={student}
                                            onStatusChange={handleStatusChange}
                                            onSelect={toggleSelect}
                                            onView={setModalStudent}
                                            isSelected={selectedIds.has(student.id)}
                                            loading={actionLoadingIds.has(student.idNumber)}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table footer */}
                    {!isLoading && filteredStudents.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                            <p className="text-sm text-gray-600">
                                Showing {filteredStudents.length} of {tabStudents.length} {activeTab} students
                            </p>
                        </div>
                    )}
                </div>

                {/* Active students grid - only show on active tab */}
                {activeTab === 'active' && activeStudents.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Active Students</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {activeStudents.slice(0, 10).map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setModalStudent(s)}
                                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-left hover:border-indigo-300 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                                        <span className="text-sm font-medium text-indigo-700">
                                            {getInitials(s.name, s.surname)}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{s.surname}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <StudentModal
                student={modalStudent}
                onClose={() => setModalStudent(null)}
                onStatusChange={handleStatusChange}
                loading={modalStudent ? actionLoadingIds.has(modalStudent.idNumber) : false}
            />

            {showApproveAllModal && (
                <ConfirmModal
                    count={pendingStudents.length}
                    onConfirm={handleApproveAll}
                    onCancel={() => setShowApproveAllModal(false)}
                    loading={bulkLoading}
                />
            )}

            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </div>
    )
}