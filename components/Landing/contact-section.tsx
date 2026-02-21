import { MapPin, Phone, Mail, Globe, Clock } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"

const contactDetails = [
  {
    icon: MapPin,
    label: "Address",
    value: "7 Grimm Street, Ster Park, Polokwane",
    href: "https://maps.google.com/?q=7+Grimm+Street+Ster+Park+Polokwane",
    iconBg: "bg-logo-red/10",
    iconColor: "text-logo-red",
    hoverBg: "group-hover:bg-logo-red",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "015 023 0600 / 079 386 6233",
    href: "tel:+27150230600",
    iconBg: "bg-logo-green/10",
    iconColor: "text-logo-green",
    hoverBg: "group-hover:bg-logo-green",
  },
  {
    icon: Mail,
    label: "Email",
    value: "admin@kiddiestown.co.za",
    href: "mailto:admin@kiddiestown.co.za",
    iconBg: "bg-logo-blue/10",
    iconColor: "text-logo-blue",
    hoverBg: "group-hover:bg-logo-blue",
  },
  {
    icon: Globe,
    label: "Website",
    value: "www.kiddiestown.co.za",
    href: "https://www.kiddiestown.co.za",
    iconBg: "bg-logo-orange/10",
    iconColor: "text-logo-orange",
    hoverBg: "group-hover:bg-logo-orange",
  },
]

export function ContactSection() {
  return (
    <section id="contact" className="py-20 md:py-28 bg-muted">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-bold text-logo-red uppercase tracking-wider">
            Get In Touch
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-foreground text-balance">
            Contact Us
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Have questions about enrolment or our programmes? We would love to
            hear from you. Visit us or get in touch today.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-2 gap-8">
          {/* Contact cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {contactDetails.map((detail) => (
              <Card key={detail.label} className="p-5 hover:shadow-md transition-shadow">
                <Link
                  href={detail.href}
                  target={detail.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    detail.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="flex flex-col gap-3 group"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${detail.iconBg} ${detail.iconColor} ${detail.hoverBg} group-hover:text-white transition-colors`}>
                    <detail.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      {detail.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground group-hover:text-logo-blue transition-colors">
                      {detail.value}
                    </p>
                  </div>
                </Link>
              </Card>
            ))}

            {/* Operating hours */}
            <Card className="p-5 sm:col-span-2">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-logo-skyblue/15 text-logo-skyblue">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Operating Hours
                  </p>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between gap-8">
                      <span className="font-medium text-foreground">
                        Monday - Friday
                      </span>
                      <span className="text-muted-foreground">
                        06:30 - 17:30
                      </span>
                    </div>
                    <div className="flex justify-between gap-8">
                      <span className="font-medium text-foreground">
                        Saturday - Sunday
                      </span>
                      <span className="text-muted-foreground">Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Map embed */}
          <div className="rounded-2xl overflow-hidden shadow-md border border-border min-h-[320px]">
            <iframe
              title="Kiddies Town ECD and Academy location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.5!2d29.45!3d-23.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDU0JzAwLjAiUyAyOcKwMjcnMDAuMCJF!5e0!3m2!1sen!2sza!4v1"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: 320 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
