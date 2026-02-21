import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Phone, Mail, Globe } from "lucide-react"

export function EnrolSection() {
  return (
    <section id="enrol" className="relative py-20 md:py-28 bg-logo-blue overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-logo-yellow/10" />
      <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-logo-pink/10" />
      <div className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full bg-logo-green/10" />

      <div className="relative mx-auto max-w-7xl px-4 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight text-balance">
          Give Your Child the Best Start in Life
        </h2>
        <p className="mt-5 text-lg text-white/85 max-w-2xl mx-auto leading-relaxed">
          Registration for 2026 is now open! Secure your child&apos;s place at
          Kiddies Town ECD and Academy. Limited spaces available.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="text-base font-bold px-8 py-6 bg-logo-orange hover:bg-logo-orange/90 text-white"
          >
            <Link href="tel:+27150230600">
              <Phone className="mr-2 h-5 w-5" />
              Call: 015 023 0600
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="text-base font-bold px-8 py-6 border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent"
          >
            <Link href="tel:+27793866233">
              <Phone className="mr-2 h-5 w-5" />
              Call: 079 386 6233
            </Link>
          </Button>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/80">
          <Link
            href="mailto:admin@kiddiestown.co.za"
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <Mail className="h-4 w-4" />
            admin@kiddiestown.co.za
          </Link>
          <Link
            href="https://www.kiddiestown.co.za"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <Globe className="h-4 w-4" />
            www.kiddiestown.co.za
          </Link>
        </div>
      </div>
    </section>
  )
}
