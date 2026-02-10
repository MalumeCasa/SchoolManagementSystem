"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DocumentScanner } from "./document-scanner"
import { Loader2, User, Users, GraduationCap, FileCheck } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FormData {
  // Student Info
  fullName: string
  email: string
  password: string
  dateOfBirth: string
  gender: string
  phone: string
  address: string
  idNumber: string
  // Guardian Info
  guardianName: string
  guardianPhone: string
  guardianEmail: string
  // Academic Info
  gradeLevel: string
}

export function StudentRegistrationForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("scan")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    address: "",
    idNumber: "",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    gradeLevel: "",
  })

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleExtractedData = (data: {
    fullName?: string
    idNumber?: string
    dateOfBirth?: string
    gender?: string
    address?: string
  }) => {
    setFormData((prev) => ({
      ...prev,
      fullName: data.fullName || prev.fullName,
      idNumber: data.idNumber || prev.idNumber,
      dateOfBirth: data.dateOfBirth || prev.dateOfBirth,
      gender: data.gender || prev.gender,
      address: data.address || prev.address,
    }))
    setActiveTab("student")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/students/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/login?registered=true")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid =
    formData.fullName &&
    formData.email &&
    formData.password &&
    formData.password.length >= 8 &&
    formData.dateOfBirth &&
    formData.gender &&
    formData.guardianName &&
    formData.guardianPhone

  if (success) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
            <FileCheck className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">Registration Successful!</h2>
          <p className="text-center text-muted-foreground">
            Your student account has been created. Redirecting to login...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Student Registration</h1>
        <p className="mt-2 text-muted-foreground">
          Create a new student account. Scan an ID document to auto-fill information.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scan" className="gap-2">
            <FileCheck className="h-4 w-4 hidden sm:inline" />
            <span>Scan ID</span>
          </TabsTrigger>
          <TabsTrigger value="student" className="gap-2">
            <User className="h-4 w-4 hidden sm:inline" />
            <span>Student</span>
          </TabsTrigger>
          <TabsTrigger value="guardian" className="gap-2">
            <Users className="h-4 w-4 hidden sm:inline" />
            <span>Guardian</span>
          </TabsTrigger>
          <TabsTrigger value="academic" className="gap-2">
            <GraduationCap className="h-4 w-4 hidden sm:inline" />
            <span>Academic</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="mt-6">
          <DocumentScanner onDataExtracted={handleExtractedData} />
          <div className="mt-4 text-center">
            <Button type="button" variant="link" onClick={() => setActiveTab("student")}>
              Skip scanning and enter details manually
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="student" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
              <CardDescription>Basic details about the student</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Enter student's full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="student@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Min. 8 characters"
                  minLength={8}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateField("dateOfBirth", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(v) => updateField("gender", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="idNumber">ID Number</Label>
                <Input
                  id="idNumber"
                  value={formData.idNumber}
                  onChange={(e) => updateField("idNumber", e.target.value)}
                  placeholder="National ID or passport number"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Enter full address"
                  rows={2}
                />
              </div>

              <div className="flex justify-end sm:col-span-2">
                <Button type="button" onClick={() => setActiveTab("guardian")}>
                  Next: Guardian Info
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guardian" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Guardian Information</CardTitle>
              <CardDescription>Parent or guardian contact details</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="guardianName">Guardian Full Name *</Label>
                <Input
                  id="guardianName"
                  value={formData.guardianName}
                  onChange={(e) => updateField("guardianName", e.target.value)}
                  placeholder="Enter guardian's full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardianPhone">Guardian Phone *</Label>
                <Input
                  id="guardianPhone"
                  type="tel"
                  value={formData.guardianPhone}
                  onChange={(e) => updateField("guardianPhone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardianEmail">Guardian Email</Label>
                <Input
                  id="guardianEmail"
                  type="email"
                  value={formData.guardianEmail}
                  onChange={(e) => updateField("guardianEmail", e.target.value)}
                  placeholder="guardian@email.com"
                />
              </div>

              <div className="flex justify-between sm:col-span-2">
                <Button type="button" variant="outline" onClick={() => setActiveTab("student")}>
                  Back
                </Button>
                <Button type="button" onClick={() => setActiveTab("academic")}>
                  Next: Academic Info
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
              <CardDescription>Class and enrollment details</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="gradeLevel">Grade Level *</Label>
                <Select value={formData.gradeLevel} onValueChange={(v) => updateField("gradeLevel", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Grade 1</SelectItem>
                    <SelectItem value="2">Grade 2</SelectItem>
                    <SelectItem value="3">Grade 3</SelectItem>
                    <SelectItem value="4">Grade 4</SelectItem>
                    <SelectItem value="5">Grade 5</SelectItem>
                    <SelectItem value="6">Grade 6</SelectItem>
                    <SelectItem value="7">Grade 7</SelectItem>
                    <SelectItem value="8">Grade 8</SelectItem>
                    <SelectItem value="9">Grade 9</SelectItem>
                    <SelectItem value="10">Grade 10</SelectItem>
                    <SelectItem value="11">Grade 11</SelectItem>
                    <SelectItem value="12">Grade 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("guardian")}>
                  Back
                </Button>
                <Button type="submit" disabled={!isFormValid || isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}
