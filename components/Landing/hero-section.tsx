import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Phone, MapPin } from "lucide-react"

export function HeroSection() {
  return (
    <section id="home" className="relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/hero-children.jpg"
          alt="Happy children learning and playing at Kiddies Town"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-logo-blue/70" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-24 md:py-36 lg:py-44">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-logo-orange px-4 py-2 text-white text-sm font-bold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            Registration for 2026 is Open
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight text-balance">
            Where Little Minds
            <span className="block text-logo-yellow">Grow Big Dreams</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/90 max-w-lg leading-relaxed">
            Kiddies Town ECD and Academy provides quality daycare, aftercare, and
            early childhood education for children aged 0-6 years in Polokwane.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              size="lg"
              className="text-base font-bold px-8 py-6 bg-logo-orange hover:bg-logo-orange/90 text-white"
            >
              <Link href="/home">Enrol Your Child</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-base font-bold px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
            >
              <Link href="tel:+27150230600">
                <Phone className="mr-2 h-5 w-5" />
                Call Us Now
              </Link>
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-2 text-white/80 text-sm">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>7 Grimm Street, Ster Park, Polokwane</span>
          </div>
        </div>
      </div>
    </section>
  )
}
