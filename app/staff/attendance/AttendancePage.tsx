"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, Download, TrendingUp } from "lucide-react"
import { Button } from "@components/ui/button"
import { Card } from "@components/ui/card"
import { Input } from "@components/ui/input"

interface AttendanceRecord {
  id: string
  staffId: string
  name: string
  date: string
  status: "present" | "absent" | "leave" | "late"
}

const STAFF_OPTIONS = ["John Smith", "Sarah Johnson", "Michael Brown", "Emily Davis", "Robert Wilson"]

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: "1", staffId: "1", name: "John Smith", date: "2024-01-15", status: "present" },
  { id: "2", staffId: "2", name: "Sarah Johnson", date: "2024-01-15", status: "present" },
  { id: "3", staffId: "3", name: "Michael Brown", date: "2024-01-15", status: "late" },
  { id: "4", staffId: "4", name: "Emily Davis", date: "2024-01-15", status: "present" },
  { id: "5", staffId: "5", name: "Robert Wilson", date: "2024-01-15", status: "absent" },
  { id: "6", staffId: "1", name: "John Smith", date: "2024-01-16", status: "present" },
  { id: "7", staffId: "2", name: "Sarah Johnson", date: "2024-01-16", status: "leave" },
  { id: "8", staffId: "3", name: "Michael Brown", date: "2024-01-16", status: "present" },
]

export default function Attendance() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  const todayAttendance = useMemo(() => attendance.filter((a) => a.date === selectedDate), [attendance, selectedDate])

  const statusConfig = {
    present: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
    absent: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", dot: "bg-red-500" },
    late: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-500" },
    leave: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", dot: "bg-blue-500" },
  }

  const handleMarkAttendance = (staffName: string, status: "present" | "absent" | "leave" | "late") => {
    const existing = todayAttendance.find((a) => a.name === staffName)

    if (existing) {
      setAttendance(attendance.map((a) => (a.id === existing.id ? { ...a, status } : a)))
    } else {
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        staffId: Date.now().toString(),
        name: staffName,
        date: selectedDate,
        status,
      }
      setAttendance([...attendance, newRecord])
    }
  }

  const stats = {
    present: todayAttendance.filter((a) => a.status === "present").length,
    absent: todayAttendance.filter((a) => a.status === "absent").length,
    late: todayAttendance.filter((a) => a.status === "late").length,
    leave: todayAttendance.filter((a) => a.status === "leave").length,
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon" className="hover:bg-slate-100 bg-transparent">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Attendance Tracking</h1>
              <p className="text-slate-600 mt-1">Real-time attendance management</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className={`p-6 border bg-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 uppercase">Present</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">{stats.present}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </Card>
          <Card className="p-6 border bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 uppercase">Absent</p>
                <p className="text-3xl font-bold text-red-700 mt-1">{stats.absent}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <span className="text-xl">✕</span>
              </div>
            </div>
          </Card>
          <Card className="p-6 border bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 uppercase">Late</p>
                <p className="text-3xl font-bold text-amber-700 mt-1">{stats.late}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <span className="text-xl">⏰</span>
              </div>
            </div>
          </Card>
          <Card className="p-6 border bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 uppercase">Leave</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">{stats.leave}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="text-xl">📅</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Date Filter */}
        <Card className="bg-white border border-slate-200 p-6 mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">Select Date</label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-11 border-slate-200 focus:border-blue-500"
          />
        </Card>

        {/* Attendance Table */}
        <Card className="bg-white border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Staff Member</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Present</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Absent</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Late</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Leave</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {STAFF_OPTIONS.map((staffName) => {
                  const record = todayAttendance.find((a) => a.name === staffName)
                  return (
                    <tr key={staffName} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{staffName}</td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          size="sm"
                          onClick={() => handleMarkAttendance(staffName, "present")}
                          className={`${
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
                          onClick={() => handleMarkAttendance(staffName, "absent")}
                          className={`${
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
                          onClick={() => handleMarkAttendance(staffName, "late")}
                          className={`${
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
                          onClick={() => handleMarkAttendance(staffName, "leave")}
                          className={`${
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
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[record.status].bg} ${statusConfig[record.status].text}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${statusConfig[record.status].dot}`}></span>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
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
    </main>
  )
}