import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, BookOpen, UserCheck, Calendar, Clock, ChevronRight } from "lucide-react"
import { getClassesByTeacher, getScheduleByTeacher, getAnnouncements } from "@/lib/db"

interface TeacherDashboardProps {
  user: {
    id: number
    fullName: string
    role: string
  }
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export async function TeacherDashboard({ user }: TeacherDashboardProps) {
  let classes: any[] = []
  let schedule: any[] = []
  let announcements: any[] = []

  try {
    classes = await getClassesByTeacher(user.id)
    schedule = await getScheduleByTeacher(user.id)
    announcements = await getAnnouncements("teachers")
  } catch (error) {
    console.log("Data not available yet - run the database migration first")
  }

  const today = new Date().getDay()
  const todaySchedule = schedule.filter((s) => s.day_of_week === today)
  const totalStudents = classes.reduce((sum, c) => sum + (c.student_count || 0), 0)

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Good day, {user.fullName}</h2>
          <p className="text-muted-foreground">
            You have {todaySchedule.length} classes scheduled for today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/attendance">
              <UserCheck className="mr-2 h-4 w-4" />
              Take Attendance
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Classes</CardTitle>
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground">Active classes this term</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Across all classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Classes</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todaySchedule.length}</div>
            <p className="text-xs text-muted-foreground">{dayNames[today]}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Next Class</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {todaySchedule.length > 0 ? todaySchedule[0].subject_name : "None today"}
            </div>
            <p className="text-xs text-muted-foreground">
              {todaySchedule.length > 0 ? `${todaySchedule[0].start_time} - ${todaySchedule[0].end_time}` : "Enjoy your day off!"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Classes and Schedule */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Classes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Classes</CardTitle>
              <CardDescription>Classes you are teaching</CardDescription>
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
                        Grade {cls.grade_level} {cls.section && `- Section ${cls.section}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {cls.student_count || 0} students
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BookOpen className="mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No classes assigned yet</p>
                <p className="text-xs text-muted-foreground">Contact admin to be assigned to classes</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Today&apos;s Schedule</CardTitle>
              <CardDescription>{dayNames[today]}&apos;s classes</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/schedule">Full schedule</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {todaySchedule.length > 0 ? (
              <div className="space-y-3">
                {todaySchedule.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex items-center gap-4 rounded-lg border p-3"
                  >
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="text-xs font-medium">{item.start_time?.slice(0, 5)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.subject_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.class_name} {item.room && `| Room ${item.room}`}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/attendance?class=${item.class_id}`}>
                        <UserCheck className="mr-1 h-4 w-4" />
                        Attendance
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No classes scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
            <CardDescription>Important updates for teachers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {announcements.slice(0, 3).map((announcement) => (
                <div key={announcement.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{announcement.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{announcement.content}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                        announcement.priority === "urgent"
                          ? "bg-destructive/10 text-destructive"
                          : announcement.priority === "high"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-primary/10 text-primary"
                      }`}
                    >
                      {announcement.priority}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Posted {new Date(announcement.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
