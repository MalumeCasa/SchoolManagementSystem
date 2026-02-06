import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/auth"
import { School, GraduationCap, Users, Calendar, Shield, BarChart3, Clock } from "lucide-react"

export default async function Home() {
  const session = await getSession()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <School className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">EduManage</span>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background px-4 py-20 lg:py-32">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <School className="h-4 w-4" />
                School Management System
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                Modern School Management
                <span className="block text-primary">Made Simple</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
                A comprehensive platform for administrators, teachers, and students. 
                Manage attendance, grades, schedules, and more in one place.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                {session ? (
                  <Button size="lg" asChild>
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" asChild>
                      <Link href="/register">
                        <GraduationCap className="mr-2 h-5 w-5" />
                        Student Registration
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/login">Staff Login</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-20 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Comprehensive tools for managing every aspect of your educational institution
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card rounded-xl p-6 border shadow-sm">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">User Management</h3>
                <p className="text-sm text-muted-foreground">
                  Manage students, teachers, and administrators with role-based access control
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 border shadow-sm">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Attendance Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Mark and track attendance easily with real-time reports and analytics
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 border shadow-sm">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Grade Management</h3>
                <p className="text-sm text-muted-foreground">
                  Record and manage grades, assignments, and academic performance
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 border shadow-sm">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Schedule Management</h3>
                <p className="text-sm text-muted-foreground">
                  Create and manage class schedules, timetables, and events
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 border shadow-sm">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Class Management</h3>
                <p className="text-sm text-muted-foreground">
                  Organize classes, subjects, and student enrollments efficiently
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 border shadow-sm">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Secure & Reliable</h3>
                <p className="text-sm text-muted-foreground">
                  Enterprise-grade security with encrypted data and secure authentication
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-20">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join our school management platform today. Students can register with just a few clicks.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/register">Register as Student</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Admin / Teacher Login</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <School className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">EduManage</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2026 EduManage School Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
