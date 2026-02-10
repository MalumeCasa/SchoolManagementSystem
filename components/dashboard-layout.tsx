"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardList,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  School,
  UserCheck,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

type UserRole = "admin" | "teacher" | "student"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "teacher", "student"] },
  { title: "Students", href: "/dashboard/students", icon: GraduationCap, roles: ["admin", "teacher"] },
  { title: "Teachers", href: "/dashboard/teachers", icon: Users, roles: ["admin"] },
  { title: "Classes", href: "/dashboard/classes", icon: School, roles: ["admin", "teacher", "student"] },
  { title: "Subjects", href: "/dashboard/subjects", icon: BookOpen, roles: ["admin", "teacher"] },
  { title: "Attendance", href: "/dashboard/attendance", icon: UserCheck, roles: ["admin", "teacher", "student"] },
  { title: "Grades", href: "/dashboard/grades", icon: BarChart3, roles: ["admin", "teacher", "student"] },
  { title: "Schedule", href: "/dashboard/schedule", icon: Calendar, roles: ["admin", "teacher", "student"] },
  { title: "Announcements", href: "/dashboard/announcements", icon: Bell, roles: ["admin", "teacher", "student"] },
  { title: "Reports", href: "/dashboard/reports", icon: ClipboardList, roles: ["admin"] },
  { title: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["admin"] },
]

interface DashboardLayoutProps {
  children: React.ReactNode
  user: {
    id: number
    fullName: string
    email: string
    role: UserRole
  }
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const filteredNavItems = navItems.filter((item) => item.roles.includes(user.role))

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/login"
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <School className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-foreground">EduManage</span>
          <span className="text-xs text-sidebar-foreground/60">School Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-sidebar-accent/50">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-sidebar-foreground">{user.fullName}</p>
                <p className="truncate text-xs capitalize text-sidebar-foreground/60">{user.role}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user.fullName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <Settings className="mr-2 h-4 w-4" />
                Profile Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 bg-sidebar p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-lg font-semibold lg:text-xl">
              {filteredNavItems.find((item) => pathname === item.href || pathname.startsWith(item.href + "/"))?.title ||
                "Dashboard"}
            </h1>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard/announcements">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
