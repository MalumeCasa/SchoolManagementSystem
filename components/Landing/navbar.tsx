"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Activities", href: "#activities" },
  { label: "Gallery", href: "#gallery" },
  { label: "FAQ", href: "#faq" },
  { label: "Meet Our Team", href: "#CompleteTeam" },
  { label: "Contact", href: "#contact" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      {/* Top announcement bar - logo blue */}
      <div className="bg-logo-blue text-white">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-2 text-sm">
          <p className="hidden sm:block font-medium">
            Registration for 2026 is Now Open!
          </p>
          <p className="sm:hidden font-medium">2026 Registration Open!</p>
          <Link
            href="tel:+27150230600"
            className="flex items-center gap-1.5 font-semibold hover:opacity-80 transition-opacity"
          >
            <Phone className="h-3.5 w-3.5" />
            015 023 0600
          </Link>
        </div>
      </div>

      {/* Main nav */}
      <nav className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3">
        <Link href="#home" className="flex items-center gap-3">
          <Image
            src="/kiddiesTown.svg"
            alt="Kiddies Town ECD and Academy logo"
            width={56}
            height={56}
            className="rounded-full"
          />
          <div className="hidden sm:block">
            <p className="text-lg font-bold text-foreground leading-tight">
              Kiddies Town
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              ECD and Academy
            </p>
          </div>
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-semibold text-foreground/80 hover:text-logo-blue transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <Button asChild size="lg" className="font-bold bg-logo-orange hover:bg-logo-orange/90 text-white">
            <Link href="/register">Enrol Now</Link>
          </Button>
          <Button asChild size="lg" className="font-bold bg-logo-green hover:bg-logo-green/90 text-white ml-4">
            <Link href="/login">Login</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 text-foreground"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-card px-4 pb-6">
          <ul className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 px-3 rounded-lg text-sm font-semibold text-foreground/80 hover:bg-muted hover:text-logo-blue transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Button asChild size="lg" className="w-full mt-4 font-bold bg-logo-green hover:bg-logo-green/90 text-white mb-2">
            <Link href="/login" onClick={() => setMobileOpen(false)}>
              Login
            </Link>
          </Button>

          <Button asChild size="lg" className="w-full mt-4 font-bold bg-logo-blue hover:bg-logo-blue/90 text-white">
            <Link href="/register" onClick={() => setMobileOpen(false)}>
              Enrol Now
            </Link>
          </Button>
        </div>
      )}
    </header>
  )
}
