import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { School } from "lucide-react"

export const metadata = {
  title: "Sign In - EduManage",
  description: "Sign in to your school account",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>
}) {
  const session = await getSession()
  const params = await searchParams

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <School className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">EduManage</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="w-full max-w-md">
          {params.registered && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-center text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
              Registration successful! Please sign in with your credentials.
            </div>
          )}

          <Card className="border-border/50 shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-semibold tracking-tight">Welcome Back</CardTitle>
              <CardDescription className="text-base">
                Sign in to access your school portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              New student?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Register here
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              Secured with industry-standard encryption
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
