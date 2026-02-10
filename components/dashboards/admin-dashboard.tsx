import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, GraduationCap, School, UserCheck, TrendingUp, TrendingDown, Bell, Plus } from "lucide-react"
import { getDashboardStats, getAnnouncements } from "@/lib/db"

interface AdminDashboardProps {
  user: {
    id: number
    fullName: string
    role: string
  }
}

export async function AdminDashboard({ user }: AdminDashboardProps) {
  let stats = { totalStudents: 0, totalTeachers: 0, totalClasses: 0, todayAttendance: { present: 0, total: 0 } }
  let announcements: any[] = []

  try {
    stats = await getDashboardStats()
    announcements = await getAnnouncements()
  } catch (error) {
    console.log("Dashboard stats not available yet - run the database migration first")
  }

  const attendanceRate =
    stats.todayAttendance.total > 0
      ? Math.round((stats.todayAttendance.present / stats.todayAttendance.total) * 100)
      : 0

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: GraduationCap,
      trend: "+12%",
      trendUp: true,
      href: "/dashboard/students",
    },
    {
      title: "Total Teachers",
      value: stats.totalTeachers,
      icon: Users,
      trend: "+3%",
      trendUp: true,
      href: "/dashboard/teachers",
    },
    {
      title: "Active Classes",
      value: stats.totalClasses,
      icon: School,
      trend: "0%",
      trendUp: true,
      href: "/dashboard/classes",
    },
    {
      title: "Today's Attendance",
      value: `${attendanceRate}%`,
      icon: UserCheck,
      trend: attendanceRate >= 90 ? "Good" : "Needs attention",
      trendUp: attendanceRate >= 90,
      href: "/dashboard/attendance",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user.fullName}</h2>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening at your school today.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/students/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="mt-1 flex items-center text-xs">
                  {stat.trendUp ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-amber-600" />
                  )}
                  <span className={stat.trendUp ? "text-green-600" : "text-amber-600"}>{stat.trend}</span>
                  <span className="ml-1 text-muted-foreground">from last month</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" className="h-auto justify-start p-4 bg-transparent" asChild>
              <Link href="/dashboard/students/new">
                <GraduationCap className="mr-3 h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Register Student</div>
                  <div className="text-xs text-muted-foreground">Add new student</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto justify-start p-4 bg-transparent" asChild>
              <Link href="/dashboard/teachers/new">
                <Users className="mr-3 h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Add Teacher</div>
                  <div className="text-xs text-muted-foreground">New staff member</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto justify-start p-4 bg-transparent" asChild>
              <Link href="/dashboard/classes/new">
                <School className="mr-3 h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Create Class</div>
                  <div className="text-xs text-muted-foreground">New class section</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto justify-start p-4 bg-transparent" asChild>
              <Link href="/dashboard/announcements/new">
                <Bell className="mr-3 h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Post Announcement</div>
                  <div className="text-xs text-muted-foreground">Notify everyone</div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Announcements</CardTitle>
              <CardDescription>Latest school updates</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/announcements">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.slice(0, 4).map((announcement) => (
                  <div key={announcement.id} className="flex gap-3">
                    <div
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        announcement.priority === "urgent"
                          ? "bg-destructive"
                          : announcement.priority === "high"
                            ? "bg-amber-500"
                            : "bg-primary"
                      }`}
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{announcement.title}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{announcement.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No announcements yet</p>
                <Button variant="link" size="sm" asChild>
                  <Link href="/dashboard/announcements/new">Create first announcement</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
