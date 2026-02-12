// app/staff/performance/page.tsx
"use client"

import { useState, useMemo } from "react"
import { Plus, Star, TrendingUp, Users, Award, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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
  reviewer?: string
  date: string
}

const INITIAL_REVIEWS: PerformanceReview[] = [
  {
    id: "1",
    staffName: "Sarah Johnson",
    position: "English Teacher",
    period: "2023-2024",
    rating: 4.5,
    attendance: 95,
    punctuality: 90,
    teaching: 92,
    teamwork: 88,
    comments: "Excellent performance. Great classroom management and student engagement.",
    reviewer: "Admin",
    date: "2024-01-15",
  },
  {
    id: "2",
    staffName: "Michael Brown",
    position: "Science Teacher",
    period: "2023-2024",
    rating: 4.0,
    attendance: 92,
    punctuality: 85,
    teaching: 88,
    teamwork: 90,
    comments: "Good overall performance. Could improve on submission timeliness.",
    reviewer: "Admin",
    date: "2024-01-14",
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
    reviewer: "Admin",
    date: "2024-01-13",
  },
  {
    id: "4",
    staffName: "John Smith",
    position: "Math Teacher",
    period: "2023-2024",
    rating: 3.8,
    attendance: 88,
    punctuality: 82,
    teaching: 85,
    teamwork: 80,
    comments: "Satisfactory performance. Needs to work on punctuality.",
    reviewer: "Admin",
    date: "2024-01-12",
  },
  {
    id: "5",
    staffName: "Robert Wilson",
    position: "History Teacher",
    period: "2023-2024",
    rating: 4.2,
    attendance: 90,
    punctuality: 88,
    teaching: 89,
    teamwork: 85,
    comments: "Good performance. Students appreciate his teaching style.",
    reviewer: "Admin",
    date: "2024-01-11",
  },
]

const PERFORMANCE_PERIODS = [
  "2023-2024",
  "2022-2023",
  "2021-2022",
]

export default function PerformancePage() {
  const [reviews, setReviews] = useState<PerformanceReview[]>(INITIAL_REVIEWS)
  const [showForm, setShowForm] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<string>("All Staff")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("2023-2024")
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

  const filteredReviews = useMemo(() => {
    let filtered = reviews.filter((r) => r.period === selectedPeriod)
    if (selectedStaff !== "All Staff") {
      filtered = filtered.filter((r) => r.staffName === selectedStaff)
    }
    return filtered
  }, [reviews, selectedStaff, selectedPeriod])

  const statistics = useMemo(() => {
    if (filteredReviews.length === 0) return null
    
    const avgRating = filteredReviews.reduce((acc, r) => acc + r.rating, 0) / filteredReviews.length
    const avgAttendance = filteredReviews.reduce((acc, r) => acc + r.attendance, 0) / filteredReviews.length
    const avgPunctuality = filteredReviews.reduce((acc, r) => acc + r.punctuality, 0) / filteredReviews.length
    const avgTeaching = filteredReviews.reduce((acc, r) => acc + r.teaching, 0) / filteredReviews.length
    const avgTeamwork = filteredReviews.reduce((acc, r) => acc + r.teamwork, 0) / filteredReviews.length
    
    return {
      avgRating: avgRating.toFixed(1),
      avgAttendance: Math.round(avgAttendance),
      avgPunctuality: Math.round(avgPunctuality),
      avgTeaching: Math.round(avgTeaching),
      avgTeamwork: Math.round(avgTeamwork),
      totalReviews: filteredReviews.length,
    }
  }, [filteredReviews])

  const handleSubmit = () => {
    if (formData.staffName && formData.position) {
      const avgRating = (
        formData.attendance + 
        formData.punctuality + 
        formData.teaching + 
        formData.teamwork
      ) / 4 / 20

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
        reviewer: "Admin",
        date: new Date().toISOString().split("T")[0],
      }
      
      setReviews([newReview, ...reviews])
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

  const getRatingBadge = (rating: number) => {
    if (rating >= 4.5) return "bg-emerald-100 text-emerald-700 border-emerald-200"
    if (rating >= 4.0) return "bg-blue-100 text-blue-700 border-blue-200"
    if (rating >= 3.5) return "bg-amber-100 text-amber-700 border-amber-200"
    return "bg-red-100 text-red-700 border-red-200"
  }

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-emerald-500"
    if (percentage >= 80) return "bg-blue-500"
    if (percentage >= 70) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Performance Reviews</h1>
          <p className="text-slate-600 mt-1">Evaluate and track staff performance</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Review
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="p-4 border bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Avg Rating</p>
                <p className="text-xl font-bold text-slate-900">{statistics.avgRating}/5</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Attendance</p>
                <p className="text-xl font-bold text-slate-900">{statistics.avgAttendance}%</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Punctuality</p>
                <p className="text-xl font-bold text-slate-900">{statistics.avgPunctuality}%</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Teamwork</p>
                <p className="text-xl font-bold text-slate-900">{statistics.avgTeamwork}%</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Teaching</p>
                <p className="text-xl font-bold text-slate-900">{statistics.avgTeaching}%</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Reviews</p>
                <p className="text-xl font-bold text-slate-900">{statistics.totalReviews}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* New Review Form */}
      {showForm && (
        <Card className="bg-white border border-slate-200 p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Create Performance Review</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              type="text"
              placeholder="Staff Name"
              value={formData.staffName}
              onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
              className="border-slate-200 focus:ring-purple-500 focus:border-purple-500"
            />
            <Input
              type="text"
              placeholder="Position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="border-slate-200 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Attendance (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.attendance}
                onChange={(e) => setFormData({ ...formData, attendance: Number.parseInt(e.target.value) })}
                className="border-slate-200 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Punctuality (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.punctuality}
                onChange={(e) => setFormData({ ...formData, punctuality: Number.parseInt(e.target.value) })}
                className="border-slate-200 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teaching Quality (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.teaching}
                onChange={(e) => setFormData({ ...formData, teaching: Number.parseInt(e.target.value) })}
                className="border-slate-200 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teamwork (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.teamwork}
                onChange={(e) => setFormData({ ...formData, teamwork: Number.parseInt(e.target.value) })}
                className="border-slate-200 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <Textarea
            placeholder="Comments and observations"
            value={formData.comments}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            className="border-slate-200 focus:ring-purple-500 focus:border-purple-500 mb-4"
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

      {/* Filters */}
      <Card className="bg-white border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="border-slate-200 focus:ring-purple-500">
              <SelectValue placeholder="Select period..." />
            </SelectTrigger>
            <SelectContent>
              {PERFORMANCE_PERIODS.map((period) => (
                <SelectItem key={period} value={period}>
                  {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStaff} onValueChange={setSelectedStaff}>
            <SelectTrigger className="border-slate-200 focus:ring-purple-500">
              <SelectValue placeholder="Filter by staff member..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Staff">All Staff</SelectItem>
              {reviews
                .filter((r) => r.period === selectedPeriod)
                .map((review) => (
                  <SelectItem key={review.id} value={review.staffName}>
                    {review.staffName}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Reviews Grid */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <Card className="bg-white border border-slate-200 p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <Star className="w-12 h-12 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900">No Reviews Found</h3>
              <p className="text-slate-600">No performance reviews available for the selected filters.</p>
              <Button
                onClick={() => setShowForm(true)}
                className="mt-2 bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Review
              </Button>
            </div>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <Card
              key={review.id}
              className="bg-white border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 pb-6 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{review.staffName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getRatingBadge(review.rating)}`}>
                        {review.rating}/5
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {review.position} • Period: {review.period}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Reviewed on {new Date(review.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(review.rating) 
                            ? "fill-yellow-400 text-yellow-400" 
                            : i < review.rating 
                            ? "fill-yellow-400 text-yellow-400 opacity-50"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
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
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${getPercentageColor(metric.value)}`}
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comments */}
                <div className="border-t border-slate-200 pt-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Reviewer Comments</p>
                  <p className="text-slate-600 bg-slate-50 p-4 rounded-lg">{review.comments}</p>
                  {review.reviewer && (
                    <p className="text-xs text-slate-500 mt-2">- {review.reviewer}</p>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}