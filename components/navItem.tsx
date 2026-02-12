// components/navItem.ts
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardList,
  Bell,
  Settings,
  School,
  UserCheck,
  BarChart3,
  Briefcase,
  Clock,
  Star,
} from "lucide-react";

export type UserRole = "admin" | "teacher" | "student";

export interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  children?: NavItem[];
}

export const navItems: NavItem[] = [
  { 
    title: "Dashboard", 
    href: "/dashboard", 
    icon: LayoutDashboard, 
    roles: ["admin", "teacher", "student"] 
  },
  {
    title: "Staff",
    icon: Briefcase,
    roles: ["admin", "teacher"],
    children: [
      { 
        title: "Attendance", 
        href: "/staff/attendance", 
        icon: Clock, 
        roles: ["admin", "teacher"] 
      },
      { 
        title: "Performance", 
        href: "/staff/performance", 
        icon: Star, 
        roles: ["admin", "teacher"] 
      },
    ],
  },
  { 
    title: "Students", 
    href: "/students", 
    icon: GraduationCap, 
    roles: ["admin", "teacher"] 
  },
  { 
    title: "Teachers", 
    href: "/dashboard/teachers", 
    icon: Users, 
    roles: ["admin"] 
  },
  { 
    title: "Classes", 
    href: "/academics/classes", 
    icon: School, 
    roles: ["admin", "teacher", "student"] 
  },
  { 
    title: "Subjects", 
    href: "/dashboard/subjects", 
    icon: BookOpen, 
    roles: ["admin", "teacher"] 
  },
  { 
    title: "Attendance", 
    href: "/dashboard/attendance", 
    icon: UserCheck, 
    roles: ["admin", "teacher", "student"] 
  },
  { 
    title: "Grades", 
    href: "/dashboard/grades", 
    icon: BarChart3, 
    roles: ["admin", "teacher", "student"] 
  },
  { 
    title: "Schedule", 
    href: "/dashboard/schedule", 
    icon: Calendar, 
    roles: ["admin", "teacher", "student"] 
  },
  { 
    title: "Announcements", 
    href: "/dashboard/announcements", 
    icon: Bell, 
    roles: ["admin", "teacher", "student"] 
  },
  { 
    title: "Reports", 
    href: "/dashboard/reports", 
    icon: ClipboardList, 
    roles: ["admin"] 
  },
  { 
    title: "Settings", 
    href: "/dashboard/settings", 
    icon: Settings, 
    roles: ["admin"] 
  },
];