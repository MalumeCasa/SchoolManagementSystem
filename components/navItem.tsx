import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardList,
  Bell,
  Settings,
  DollarSign,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  School,
  UserCheck,
  BarChart3,
  Home,
  ChartNoAxesGantt,
  UserCog,
  Briefcase,
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
    icon: LayoutDashboard,
    roles: ["admin", "teacher", "student"],
    children: [
      { 
        title: "Overview", 
        href: "/dashboard", 
        icon: Home, 
        roles: ["admin", "teacher", "student"] 
      },
      { 
        title: "Analytics", 
        href: "/dashboard/analytics", 
        icon: BarChart3, 
        roles: ["admin", "teacher"] 
      },
    ],
  },
  {
    title: "Student Management",
    icon: GraduationCap,
    roles: ["admin", "teacher"],
    children: [
      { 
        title: "Students", 
        href: "/student/students", 
        icon: School, 
        roles: ["admin", "teacher", "student"] 
      },
      { 
        title: "Fees", 
        href: "/student/fees", 
        icon: DollarSign, 
        roles: ["admin", "teacher"] 
      },
      { 
        title: "Attendance", 
        href: "/student/attendance", 
        icon: ClipboardList, 
        roles: ["admin", "teacher"] 
      },
    ],
  },
  {
    title: "Academics",
    icon: BookOpen,
    roles: ["admin", "teacher", "student"],
    children: [
      { 
        title: "Classes", 
        href: "/academics/classes", 
        icon: School, 
        roles: ["admin", "teacher", "student"] 
      },
      { 
        title: "Subjects", 
        href: "/academics/subjects", 
        icon: BookOpen, 
        roles: ["admin", "teacher"] 
      },
      { 
        title: "Curriculum", 
        href: "/academics/curriculum", 
        icon: ClipboardList, 
        roles: ["admin", "teacher"] 
      },
    ],
  },
  { 
    title: "Staff", 
    href: "/dashboard/teachers", 
    icon: Users, 
    roles: ["admin"],
    children: [
      { 
        title: "Staff", 
        href: "/staff", 
        icon: Users, 
        roles: ["admin"] 
      },
        {
            title: "Attendance",
            href: "/staff/attendance",
            icon: UserCheck,
            roles: ["admin", "teacher"]
        },
        // leave, performance, 
        {
            title: "Performance",
            href: "/staff/performance",
            icon: ChartNoAxesGantt,
            roles: ["admin", "teacher"]
        },
        {
            title: "Leave",
            href: "/staff/leave",
            icon: Briefcase,
            roles: ["admin", "teacher"]
        }
    ],
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