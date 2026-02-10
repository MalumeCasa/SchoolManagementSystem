import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, UserCheck, Calendar, Clock, Award, TrendingUp, Bell } from "lucide-react"
import { getClassesByStudent, getAttendanceStats, getGradesByStudent, getAnnouncements } from "@/lib/db"
import { Progress } from "@/components/ui/progress"

interface StudentDashboardProps {
  user: {
    id: number
    fullName: string
    role: string
    studentId?: string
  }
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export async function StudentDashboard({ user }: StudentDashboardProps) {
  let classes: any[] = []
  let attendanceStats = { present: 0, absent: 0, late: 0, excused: 0 }
  let grades: any[] = []
  let announcements: any[] = []

  try {
    classes = await getClassesByStudent(user.id)
    attendanceStats = await getAttendanceStats(user.id)
    grades = await getGradesByStudent(user.id)
    announcements = await getAnnouncements("students")
  } catch (error) {
    console.log("Data not available yet - run the database migration first")
  }

  const totalAttendance = attendanceStats.present + attendanceStats.absent + attendanceStats.late + attendanceStats.excused
  const attendanceRate = totalAttendance > 0 ? Math.round((attendanceStats.present / totalAttendance) * 100) : 100

  // Calculate average grade
  const averageGrade =
    grades.length > 0
      ? Math.round(grades.reduce((sum, g) => sum + (g.score / g.max_score) * 100, 0) / grades.length)
      : 0

  const today = new Date().getDay()

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Hello, {user.fullName}!</h2>
          <p className="text-muted-foreground">
            {user.studentId && `Student ID: ${user.studentId} | `}
            {dayNames[today]}, {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/schedule">
              <Calendar className="mr-2 h-4 w-4" />
              My Schedule
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/grades">
              <Award className="mr-2 h-4 w-4" />
              View Grades
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled Classes</CardTitle>
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground">Active this semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
            <UserCheck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{attendanceRate}%</div>
            <Progress value={attendanceRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Grade</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averageGrade > 0 ? `${averageGrade}%` : "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              {averageGrade >= 90 ? "Excellent!" : averageGrade >= 80 ? "Great job!" : averageGrade >= 70 ? "Good progress" : "Keep working!"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assignments</CardTitle>
            <Award className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{grades.length}</div>
            <p className="text-xs text-muted-foreground">Graded this term</p>
          </CardContent>
        </Card>
      </div>

      {/* Classes and Attendance */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Classes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Classes</CardTitle>
              <CardDescription>Your enrolled courses</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/classes">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {classes.length > 0 ? (
              <div className="space-y-3">
                {classes.slice(0, 5).map((cls) => (
                  <Link
                    key={cls.id}
                    href={`/dashboard/classes/${cls.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{cls.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Grade {cls.grade_level} | {cls.teacher_name || "TBA"}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {cls.room_number && `Room ${cls.room_number}`}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BookOpen className="mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Not enrolled in any classes yet</p>
                <p className="text-xs text-muted-foreground">Contact your admin for enrollment</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Attendance Summary</CardTitle>
              <CardDescription>Your attendance record</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/attendance">Details</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {totalAttendance > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-sm">Present</span>
                  </div>
                  <span className="font-medium">{attendanceStats.present} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-sm">Absent</span>
                  </div>
                  <span className="font-medium">{attendanceStats.absent} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <span className="text-sm">Late</span>
                  </div>
                  <span className="font-medium">{attendanceStats.late} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="text-sm">Excused</span>
                  </div>
                  <span className="font-medium">{attendanceStats.excused} days</span>
                </div>
                <div className="mt-4 rounded-lg bg-muted p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Attendance</span>
                    <span className={`font-bold ${attendanceRate >= 90 ? "text-green-600" : attendanceRate >= 75 ? "text-amber-600" : "text-red-600"}`}>
                      {attendanceRate}%
                    </span>
                  </div>
                  <Progress value={attendanceRate} className="mt-2 h-2" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <UserCheck className="mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No attendance records yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Grades */}
      {grades.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Grades</CardTitle>
              <CardDescription>Your latest assignments and tests</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/grades">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {grades.slice(0, 5).map((grade) => {
                const percentage = Math.round((grade.score / grade.max_score) * 100)
                return (
                  <div key={grade.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{grade.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {grade.subject_name} | {grade.grade_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${percentage >= 90 ? "text-green-600" : percentage >= 70 ? "text-amber-600" : "text-red-600"}`}>
                        {grade.score}/{grade.max_score}
                      </p>
                      <p className="text-xs text-muted-foreground">{percentage}%</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Announcements</CardTitle>
              <CardDescription>Important updates for students</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/announcements">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {announcements.slice(0, 3).map((announcement) => (
                <div key={announcement.id} className="rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <Bell className={`mt-0.5 h-5 w-5 shrink-0 ${
                      announcement.priority === "urgent" ? "text-destructive" : "text-primary"
                    }`} />
                    <div>
                      <h4 className="font-medium">{announcement.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{announcement.content}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
