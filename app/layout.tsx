import type { Metadata, Viewport } from 'next'
import { Nunito, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Kiddies Town ECD and Academy | Polokwane',
  description: 'Kiddies Town ECD and Academy offers quality daycare, aftercare, and early childhood education for children aged 0-6 years in Ster Park, Polokwane. Registration for 2026 is now open.',
  keywords: ['kindergarten', 'daycare', 'aftercare', 'ECD', 'early childhood development', 'Polokwane', 'Ster Park', 'nursery school'],
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

export const viewport: Viewport = {
  themeColor: '#1a6bdb',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
