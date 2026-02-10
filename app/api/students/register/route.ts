import { NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth"
import { createUser, getUserByEmail } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      fullName,
      email,
      password,
      dateOfBirth,
      gender,
      phone,
      address,
      idNumber,
      guardianName,
      guardianPhone,
      guardianEmail,
    } = body

    // Validate required fields
    if (!fullName || !email || !password || !dateOfBirth || !gender || !guardianName || !guardianPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Generate student ID
    const studentId = `STU${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`

    // Create user with student role
    const user = await createUser(email, passwordHash, fullName, "student", {
      student_id: studentId,
      phone,
      address,
      date_of_birth: dateOfBirth,
      gender,
      id_number: idNumber,
      guardian_name: guardianName,
      guardian_phone: guardianPhone,
      guardian_email: guardianEmail,
    })

    return NextResponse.json({
      success: true,
      message: "Student registered successfully",
      studentId: user.student_id,
    })
  } catch (error) {
    console.error("Student registration error:", error)
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 })
  }
}
