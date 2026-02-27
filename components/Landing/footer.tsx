import Image from "next/image"
import Link from "next/link"
import { Phone, Mail, MapPin } from "lucide-react"

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Activities", href: "#activities" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
  { label: "Enrol Now", href: "#enrol" },
  // landing page links for fees, staff, developers
  { label: "Fees", href: "/Fees" },
  { label: "Staff", href: "/staff" },
  { label: "Developers", href: "/developers" },
]

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Colorful top border bar using logo colors */}
      <div className="flex h-1.5">
        <div className="flex-1 bg-logo-red" />
        <div className="flex-1 bg-logo-orange" />
        <div className="flex-1 bg-logo-yellow" />
        <div className="flex-1 bg-logo-green" />
        <div className="flex-1 bg-logo-blue" />
        <div className="flex-1 bg-logo-skyblue" />
        <div className="flex-1 bg-logo-pink" />
        <div className="flex-1 bg-logo-purple" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="#home" className="flex items-center gap-3">
              <Image
                src="/kiddiesTown.svg"
                alt="Kiddies Town logo"
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <p className="text-lg font-bold leading-tight">Kiddies Town</p>
                <p className="text-xs text-background/60">ECD and Academy</p>
              </div>
            </Link>
            <p className="mt-4 text-sm text-background/70 leading-relaxed max-w-xs">
              Quality daycare, aftercare, and early childhood education for
              children aged 0-6 years in Polokwane.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-logo-yellow">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/70 hover:text-logo-skyblue transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-logo-yellow">
              Contact
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="tel:+27150230600"
                  className="flex items-center gap-2 text-sm text-background/70 hover:text-logo-skyblue transition-colors"
                >
                  <Phone className="h-4 w-4 shrink-0 text-logo-green" />
                  015 023 0600
                </Link>
              </li>
              <li>
                <Link
                  href="tel:+27793866233"
                  className="flex items-center gap-2 text-sm text-background/70 hover:text-logo-skyblue transition-colors"
                >
                  <Phone className="h-4 w-4 shrink-0 text-logo-green" />
                  079 386 6233
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:admin@kiddiestown.co.za"
                  className="flex items-center gap-2 text-sm text-background/70 hover:text-logo-skyblue transition-colors"
                >
                  <Mail className="h-4 w-4 shrink-0 text-logo-orange" />
                  admin@kiddiestown.co.za
                </Link>
              </li>
              <li>
                <div className="flex items-start gap-2 text-sm text-background/70">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-logo-red" />
                  7 Grimm Street, Ster Park, Polokwane
                </div>
              </li>
            </ul>
          </div>

          {/* Programmes */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-logo-yellow">
              Our Programmes
            </h4>
            <ul className="mt-4 space-y-2.5">
              <li className="text-sm text-background/70">Baby Care (0-2)</li>
              <li className="text-sm text-background/70">Toddler Programme (2-3)</li>
              <li className="text-sm text-background/70">Pre-School (3-5)</li>
              <li className="text-sm text-background/70">Grade R (5-6)</li>
              <li className="text-sm text-background/70">Aftercare</li>
              <li className="text-sm text-background/70">Holiday Programme</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <div className="mx-auto max-w-7xl px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-background/50">
          <p>
            &copy; {new Date().getFullYear()} Kiddies Town ECD and Academy. All
            rights reserved.
          </p>
          <p>7 Grimm Street, Ster Park, Polokwane, South Africa</p>
        </div>
      </div>
    </footer>
  )
}
