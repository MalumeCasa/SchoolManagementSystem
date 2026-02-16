"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PerformanceReview {
  id: string
  staffName: string
  position: string
  period: string
  rating: number
  attendance: number
  punctuality: number
  teaching: number
  teamwork: number
  comments: string
}

const INITIAL_REVIEWS: PerformanceReview[] = [
  {
    id: "1",
    staffName: "Sarah Johnson",
    position: "Math Teacher",
    period: "2023-2024",
    rating: 4.5,
    attendance: 95,
    punctuality: 90,
    teaching: 92,
    teamwork: 88,
    comments: "Excellent performance. Great classroom management and student engagement.",
  },
  {
    id: "2",
    staffName: "Michael Brown",
    position: "English Teacher",
    period: "2023-2024",
    rating: 4.0,
    attendance: 92,
    punctuality: 85,
    teaching: 88,
    teamwork: 90,
    comments: "Good overall performance. Could improve on submission timeliness.",
  },
  {
    id: "3",
    staffName: "Emily Davis",
    position: "Counselor",
    period: "2023-2024",
    rating: 4.7,
    attendance: 98,
    punctuality: 95,
    teaching: 94,
    teamwork: 96,
    comments: "Outstanding performance. Highly dedicated and compassionate approach.",
  },
]

export default function StaffPerformance({ user }: { user: { id: number; fullName: string; role: string } }) {
  const [reviews, setReviews] = useState<PerformanceReview[]>(INITIAL_REVIEWS)
  const [showForm, setShowForm] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<string>("All Staff")
  const [formData, setFormData] = useState({
    staffName: "",
    position: "",
    period: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
    attendance: 90,
    punctuality: 85,
    teaching: 85,
    teamwork: 85,
    comments: "",
  })

  const filteredReviews = useMemo(
    () => (selectedStaff !== "All Staff" ? reviews.filter((r) => r.staffName === selectedStaff) : reviews),
    [reviews, selectedStaff],
  )

  const handleSubmit = () => {
    if (formData.staffName) {
      const avgRating = (formData.attendance + formData.punctuality + formData.teaching + formData.teamwork) / 4 / 20

      const newReview: PerformanceReview = {
        id: Date.now().toString(),
        staffName: formData.staffName,
        position: formData.position,
        period: formData.period,
        rating: Number.parseFloat(avgRating.toFixed(1)),
        attendance: formData.attendance,
        punctuality: formData.punctuality,
        teaching: formData.teaching,
        teamwork: formData.teamwork,
        comments: formData.comments,
      }
      setReviews([...reviews, newReview])
      setFormData({
        staffName: "",
        position: "",
        period: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
        attendance: 90,
        punctuality: 85,
        teaching: 85,
        teamwork: 85,
        comments: "",
      })
      setShowForm(false)
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-emerald-600"
    if (rating >= 4.0) return "text-blue-600"
    if (rating >= 3.5) return "text-amber-600"
    return "text-red-600"
  }

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-emerald-500"
    if (percentage >= 80) return "bg-blue-500"
    if (percentage >= 70) return "bg-amber-500"
    return "bg-red-500"
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
              <h1 className="text-4xl font-bold text-slate-900">Performance Reviews</h1>
              <p className="text-slate-600 mt-1">Evaluate and track staff performance</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Review
          </Button>
        </div>

        {/* New Review Form */}
        {showForm && (
          <Card className="bg-white border border-slate-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Create Performance Review</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Staff Name"
                value={formData.staffName}
                onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                className="border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="Position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Attendance (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.attendance}
                  onChange={(e) => setFormData({ ...formData, attendance: Number.parseInt(e.target.value) })}
                  className="border border-slate-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Punctuality (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.punctuality}
                  onChange={(e) => setFormData({ ...formData, punctuality: Number.parseInt(e.target.value) })}
                  className="border border-slate-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teaching Quality (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.teaching}
                  onChange={(e) => setFormData({ ...formData, teaching: Number.parseInt(e.target.value) })}
                  className="border border-slate-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teamwork (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.teamwork}
                  onChange={(e) => setFormData({ ...formData, teamwork: Number.parseInt(e.target.value) })}
                  className="border border-slate-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <textarea
              placeholder="Comments and observations"
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              className="border border-slate-200 rounded-lg px-3 py-2 w-full mb-4 focus:ring-2 focus:ring-purple-500"
              rows={3}
            />

            <div className="flex gap-3">
              <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700">
                Save Review
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

        {/* Filter by Staff */}
        <Card className="bg-white border border-slate-200 p-4 mb-6">
          <Select value={selectedStaff} onValueChange={setSelectedStaff}>
            <SelectTrigger className="w-full md:w-64 border-slate-200 focus:ring-purple-500">
              <SelectValue placeholder="Filter by staff member..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Staff">All Staff</SelectItem>
              {reviews.map((review) => (
                <SelectItem key={review.id} value={review.staffName}>
                  {review.staffName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {/* Reviews Grid */}
        <div className="space-y-6">
          {filteredReviews.map((review) => (
            <Card
              key={review.id}
              className="bg-white border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-200">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{review.staffName}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {review.position} • Period: {review.period}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(review.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-3xl font-bold ${getRatingColor(review.rating)}`}>{review.rating}/5</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {[
                    { label: "Attendance", value: review.attendance },
                    { label: "Punctuality", value: review.punctuality },
                    { label: "Teaching Quality", value: review.teaching },
                    { label: "Teamwork", value: review.teamwork },
                  ].map((metric) => (
                    <div key={metric.label}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-700">{metric.label}</span>
                        <span className="text-sm font-bold text-slate-900">{metric.value}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${getPercentageColor(metric.value)}`}
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comments */}
                <div className="border-t border-slate-200 pt-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Reviewer Comments</p>
                  <p className="text-slate-600">{review.comments}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
