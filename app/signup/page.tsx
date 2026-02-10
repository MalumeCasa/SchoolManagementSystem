import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Users } from "lucide-react";

export const metadata = {
  title: "Sign Up - EduManage School System",
  description: "Create a new account to get started with the school management system",
};

export default async function SignupPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <span className="text-2xl font-bold">EduManage</span>
          </div>
          <p className="text-muted-foreground">School Management System</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold tracking-tight">Create an Account</CardTitle>
            <CardDescription className="text-base">
              Choose your registration type to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Link href="/register" className="block">
                <div className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Student Registration</h3>
                    <p className="text-sm text-muted-foreground">
                      New student enrollment with document scanning
                    </p>
                  </div>
                </div>
              </Link>

              <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/30 opacity-60 cursor-not-allowed">
                <div className="p-3 rounded-lg bg-muted">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-muted-foreground">Teacher Registration</h3>
                  <p className="text-sm text-muted-foreground">
                    Contact admin for teacher account setup
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/30 opacity-60 cursor-not-allowed">
                <div className="p-3 rounded-lg bg-muted">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-muted-foreground">Parent/Guardian</h3>
                  <p className="text-sm text-muted-foreground">
                    Parent accounts linked to enrolled students
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Already have an account?</span>
              </div>
            </div>

            <Link href="/login">
              <Button variant="outline" className="w-full bg-transparent">
                Sign in to your account
              </Button>
            </Link>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Your data is encrypted and secure
        </p>
      </div>
    </div>
  );
}
