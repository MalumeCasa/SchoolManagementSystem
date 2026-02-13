// components/fees/FeesDashboard.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  Users, 
  FileText, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import Link from "next/link";

interface FeesDashboardProps {
  stats: {
    totalCollected: number;
    pendingPayments: number;
    totalStudents: number;
    paidStudents: number;
    pendingStudents: number;
    monthlyGrowth: number;
  };
  recentPayments: Array<{
    id: string;
    studentName: string;
    amount: number;
    date: string;
    status: string;
  }>;
}

export function FeesDashboard({ stats, recentPayments }: FeesDashboardProps) {
  const quickActions = [
    {
      title: "Fee Structure",
      description: "Manage fee categories and amounts",
      icon: FileText,
      href: "/dashboard/fees/structure",
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Student Fees",
      description: "View and manage student fees",
      icon: Users,
      href: "/dashboard/fees/students",
      color: "bg-green-50 text-green-600"
    },
    {
      title: "Record Payment",
      description: "Record manual fee payments",
      icon: DollarSign,
      href: "/dashboard/fees/payments?action=create",
      color: "bg-purple-50 text-purple-600"
    },
    {
      title: "Payment History",
      description: "View all fee transactions",
      icon: TrendingUp,
      href: "/dashboard/fees/payments",
      color: "bg-orange-50 text-orange-600"
    }
  ];

  const collectionRate = (stats.totalCollected / (stats.totalCollected + stats.pendingPayments)) * 100;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalCollected.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats.monthlyGrowth > 0 ? (
                <>
                  <ArrowUpRight className="w-3 h-3 text-green-600 mr-1" />
                  <span className="text-green-600">+{stats.monthlyGrowth}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3 h-3 text-red-600 mr-1" />
                  <span className="text-red-600">{stats.monthlyGrowth}%</span>
                </>
              )}
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.pendingPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {stats.pendingStudents} students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Students</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paidStudents}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.paidStudents / stats.totalStudents) * 100)}% completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across all classes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Card key={action.title} className="cursor-pointer hover:shadow-md transition-shadow">
            <Link href={action.href}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="w-4 h-4" />
                </div>
                <CardTitle className="text-sm font-medium ml-2">
                  {action.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* Recent Activity & Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Latest fee transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{payment.studentName}</p>
                    <p className="text-sm text-muted-foreground">{payment.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${payment.amount}</p>
                    <p className={`text-sm ${
                      payment.status === "Paid" ? "text-green-600" : "text-orange-600"
                    }`}>
                      {payment.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fee Collection Status</CardTitle>
            <CardDescription>Current month overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Collection Rate</span>
                <span className="font-medium">{collectionRate.toFixed(1)}%</span>
              </div>
              <Progress value={collectionRate} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected</span>
                  <span className="font-medium">
                    ${(stats.totalCollected + stats.pendingPayments).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Collected</span>
                  <span className="font-medium text-green-600">
                    ${stats.totalCollected.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-medium text-orange-600">
                    ${stats.pendingPayments.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Students</span>
                  <span className="font-medium">{stats.totalStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="font-medium text-green-600">{stats.paidStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-medium text-orange-600">{stats.pendingStudents}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}