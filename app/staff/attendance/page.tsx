// app/staff/attendance/page.tsx
"use client"

import { useState, useMemo } from "react"
import { Download, TrendingUp, Users, Clock, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AttendanceRecord {
  id: string
  staffId: string
  name: string
  date: string
  status: "present" | "absent" | "late" | "leave"
}

const STAFF_OPTIONS = [
  { id: "1", name: "John Smith", position: "Math Teacher" },
  { id: "2", name: "Sarah Johnson", position: "English Teacher" },
  { id: "3", name: "Michael Brown", position: "Science Teacher" },
  { id: "4", name: "Emily Davis", position: "Counselor" },
  { id: "5", name: "Robert Wilson", position: "History Teacher" },
]

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: "1", staffId: "1", name: "John Smith", date: "2024-01-15", status: "present" },
  { id: "2", staffId: "2", name: "Sarah Johnson", date: "2024-01-15", status: "present" },
  { id: "3", staffId: "3", name: "Michael Brown", date: "2024-01-15", status: "late" },
  { id: "4", staffId: "4", name: "Emily Davis", date: "2024-01-15", status: "present" },
  { id: "5", staffId: "5", name: "Robert Wilson", date: "2024-01-15", status: "absent" },
  { id: "6", staffId: "1", name: "John Smith", date: "2024-01-16", status: "present" },
  { id: "7", staffId: "2", name: "Sarah Johnson", date: "2024-01-16", status: "leave" },
  { id: "8", staffId: "3", name: "Michael Brown", date: "2024-01-16", status: "present" },
  { id: "9", staffId: "4", name: "Emily Davis", date: "2024-01-16", status: "present" },
  { id: "10", staffId: "5", name: "Robert Wilson", date: "2024-01-16", status: "late" },
]

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedStaff, setSelectedStaff] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const todayAttendance = useMemo(() => 
    attendance.filter((a) => a.date === selectedDate), 
    [attendance, selectedDate]
  )

  const filteredAttendance = useMemo(() => {
    return todayAttendance.filter((record) => {
      const matchesStaff = selectedStaff === "all" || record.staffId === selectedStaff
      const matchesStatus = filterStatus === "all" || record.status === filterStatus
      return matchesStaff && matchesStatus
    })
  }, [todayAttendance, selectedStaff, filterStatus])

  const stats = {
    present: todayAttendance.filter((a) => a.status === "present").length,
    absent: todayAttendance.filter((a) => a.status === "absent").length,
    late: todayAttendance.filter((a) => a.status === "late").length,
    leave: todayAttendance.filter((a) => a.status === "leave").length,
    total: STAFF_OPTIONS.length,
  }

  const handleMarkAttendance = (staffId: string, staffName: string, status: "present" | "absent" | "late" | "leave") => {
    const existing = todayAttendance.find((a) => a.staffId === staffId)

    if (existing) {
      setAttendance(attendance.map((a) => 
        a.id === existing.id ? { ...a, status } : a
      ))
    } else {
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        staffId,
        name: staffName,
        date: selectedDate,
        status,
      }
      setAttendance([...attendance, newRecord])
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      present: "bg-emerald-100 text-emerald-700 border-emerald-200",
      absent: "bg-red-100 text-red-700 border-red-200",
      late: "bg-amber-100 text-amber-700 border-amber-200",
      leave: "bg-blue-100 text-blue-700 border-blue-200",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-200"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Staff Attendance</h1>
          <p className="text-slate-600 mt-1">Track and manage staff attendance records</p>
        </div>
        <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-6 border bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Staff</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 border bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Present</p>
              <p className="text-3xl font-bold text-emerald-700 mt-1">{stats.present}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 border bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Absent</p>
              <p className="text-3xl font-bold text-red-700 mt-1">{stats.absent}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <span className="text-xl">✕</span>
            </div>
          </div>
        </Card>
        <Card className="p-6 border bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Late</p>
              <p className="text-3xl font-bold text-amber-700 mt-1">{stats.late}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 border bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">On Leave</p>
              <p className="text-3xl font-bold text-blue-700 mt-1">{stats.leave}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Date</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Filter by Staff</label>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger className="h-11 border-slate-200 focus:ring-emerald-500">
                <SelectValue placeholder="All Staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {STAFF_OPTIONS.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.name} - {staff.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Filter by Status</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-11 border-slate-200 focus:ring-emerald-500">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Attendance Table */}
      <Card className="bg-white border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Staff Member</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Position</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Present</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Absent</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Late</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Leave</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Current Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {STAFF_OPTIONS.map((staff) => {
                const record = todayAttendance.find((a) => a.staffId === staff.id)
                return (
                  <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{staff.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">{staff.position}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        size="sm"
                        onClick={() => handleMarkAttendance(staff.id, staff.name, "present")}
                        className={`w-16 ${
                          record?.status === "present"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        ✓
                      </Button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        size="sm"
                        onClick={() => handleMarkAttendance(staff.id, staff.name, "absent")}
                        className={`w-16 ${
                          record?.status === "absent"
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        ✕
                      </Button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        size="sm"
                        onClick={() => handleMarkAttendance(staff.id, staff.name, "late")}
                        className={`w-16 ${
                          record?.status === "late"
                            ? "bg-amber-600 hover:bg-amber-700 text-white"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        L
                      </Button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        size="sm"
                        onClick={() => handleMarkAttendance(staff.id, staff.name, "leave")}
                        className={`w-16 ${
                          record?.status === "leave"
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        L/V
                      </Button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {record ? (
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize border ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">Not marked</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}