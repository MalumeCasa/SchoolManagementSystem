"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface LeaveRequest {
  id: string
  staffName: string
  leaveType: string
  fromDate: string
  toDate: string
  reason: string
  status: "pending" | "approved" | "rejected"
  dayCount: number
}

const LEAVE_TYPES = ["Sick Leave", "Vacation", "Personal", "Maternity", "Study Leave", "Other"]

const INITIAL_REQUESTS: LeaveRequest[] = [
  {
    id: "1",
    staffName: "Sarah Johnson",
    leaveType: "Vacation",
    fromDate: "2024-02-01",
    toDate: "2024-02-05",
    reason: "Family vacation",
    status: "pending",
    dayCount: 5,
  },
  {
    id: "2",
    staffName: "Michael Brown",
    leaveType: "Sick Leave",
    fromDate: "2024-01-20",
    toDate: "2024-01-22",
    reason: "Medical treatment",
    status: "approved",
    dayCount: 3,
  },
  {
    id: "3",
    staffName: "Emily Davis",
    leaveType: "Personal",
    fromDate: "2024-02-10",
    toDate: "2024-02-10",
    reason: "Personal emergency",
    status: "pending",
    dayCount: 1,
  },
  {
    id: "4",
    staffName: "Robert Wilson",
    leaveType: "Vacation",
    fromDate: "2024-03-01",
    toDate: "2024-03-07",
    reason: "Holiday trip",
    status: "rejected",
    dayCount: 7,
  },
]

export default function LeaveManagement({ user }: { user: { id: number; fullName: string; role: string } }) {
  const [requests, setRequests] = useState<LeaveRequest[]>(INITIAL_REQUESTS)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [formData, setFormData] = useState({
    staffName: "",
    leaveType: "Vacation",
    fromDate: "",
    toDate: "",
    reason: "",
  })

  const filteredRequests = useMemo(
    () => (filter === "all" ? requests : requests.filter((r) => r.status === filter)),
    [requests, filter],
  )

  const calculateDays = (from: string, to: string) => {
    if (!from || !to) return 0
    const start = new Date(from)
    const end = new Date(to)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1
  }

  const handleSubmit = () => {
    if (formData.staffName && formData.fromDate && formData.toDate) {
      const newRequest: LeaveRequest = {
        id: Date.now().toString(),
        staffName: formData.staffName,
        leaveType: formData.leaveType,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        reason: formData.reason,
        status: "pending",
        dayCount: calculateDays(formData.fromDate, formData.toDate),
      }
      setRequests([...requests, newRequest])
      setFormData({
        staffName: "",
        leaveType: "Vacation",
        fromDate: "",
        toDate: "",
        reason: "",
      })
      setShowForm(false)
    }
  }

  const statusConfig = {
    pending: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100" },
    approved: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100" },
    rejected: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100" },
  }

  const stats = {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
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
              <h1 className="text-4xl font-bold text-slate-900">Leave Management</h1>
              <p className="text-slate-600 mt-1">Review and manage leave requests</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-white border border-slate-200">
            <p className="text-sm font-medium text-slate-600 uppercase">Pending</p>
            <p className="text-3xl font-bold text-amber-700 mt-1">{stats.pending}</p>
          </Card>
          <Card className="p-6 bg-white border border-slate-200">
            <p className="text-sm font-medium text-slate-600 uppercase">Approved</p>
            <p className="text-3xl font-bold text-emerald-700 mt-1">{stats.approved}</p>
          </Card>
          <Card className="p-6 bg-white border border-slate-200">
            <p className="text-sm font-medium text-slate-600 uppercase">Rejected</p>
            <p className="text-3xl font-bold text-red-700 mt-1">{stats.rejected}</p>
          </Card>
        </div>

        {/* Add Request Form */}
        {showForm && (
          <Card className="bg-white border border-slate-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Submit Leave Request</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Staff Name"
                value={formData.staffName}
                onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                className="border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                className="border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                {LEAVE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={formData.fromDate}
                onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                className="border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={formData.toDate}
                onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                className="border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Reason for leave"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="border border-slate-200 rounded-lg px-3 py-2 md:col-span-2 focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                Submit Request
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Filter */}
        <div className="mb-6 flex gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
              className={
                filter === status ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-slate-200 hover:bg-slate-50"
              }
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card
              key={request.id}
              className={`border ${statusConfig[request.status].border} bg-white overflow-hidden hover:shadow-md transition-shadow`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{request.staffName}</h3>
                    <p className="text-sm text-slate-600 mt-1">{request.leaveType}</p>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[request.status].badge} ${statusConfig[request.status].text}`}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="font-semibold text-slate-700">From</p>
                    <p className="text-slate-600">{new Date(request.fromDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">To</p>
                    <p className="text-slate-600">{new Date(request.toDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Days</p>
                    <p className="text-slate-600">{request.dayCount}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Reason</p>
                    <p className="text-slate-600">{request.reason}</p>
                  </div>
                </div>

                {request.status === "pending" && (
                  <div className="flex gap-2 pt-4 border-t border-slate-200">
                    <Button
                      size="sm"
                      onClick={() => {
                        setRequests(requests.map((r) => (r.id === request.id ? { ...r, status: "approved" } : r)))
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setRequests(requests.map((r) => (r.id === request.id ? { ...r, status: "rejected" } : r)))
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
