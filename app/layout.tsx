// app/layout.tsx
import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { requireAuth } from "@/lib/auth"
import { Layout } from "@/components/layout"
import './globals.css'

const geistSans = Geist({ 
  subsets: ["latin"],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'EduManager - School Management System',
  description: 'Complete school management solution for administrators, teachers, and students',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Get user but don't redirect - let protected routes handle auth
  const user = await requireAuth().catch(() => null)
  
  // If no user, render without layout (for login page etc)
  if (!user) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body 
          className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
          suppressHydrationWarning
        >
          {children}
          <Analytics />
        </body>
      </html>
    )
  }

  // Transform user to LayoutUser type (remove optional fields for layout)
  const layoutUser = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Layout user={layoutUser}>
          {children}
        </Layout>
        <Analytics />
      </body>
    </html>
  )
}