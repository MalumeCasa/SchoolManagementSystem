import {
  BookOpen,
  Users,
  Monitor,
  Shield,
  Clock,
  GraduationCap,
  Palette,
  Baby,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const services = [
  {
    icon: BookOpen,
    title: "Classroom Activities",
    description:
      "Structured, age-appropriate classroom activities that build cognitive skills, creativity, and social development.",
    iconBg: "bg-logo-blue/10",
    iconColor: "text-logo-blue",
    hoverBg: "group-hover:bg-logo-blue",
    borderAccent: "border-t-logo-blue",
  },
  {
    icon: Users,
    title: "Qualified Teachers",
    description:
      "Our dedicated and qualified educators nurture each child with patience, care, and professional expertise.",
    iconBg: "bg-logo-green/10",
    iconColor: "text-logo-green",
    hoverBg: "group-hover:bg-logo-green",
    borderAccent: "border-t-logo-green",
  },
  {
    icon: GraduationCap,
    title: "NCF ELDA Themes",
    description:
      "We follow the National Curriculum Framework for Early Learning and Development Areas to prepare children for school.",
    iconBg: "bg-logo-purple/10",
    iconColor: "text-logo-purple",
    hoverBg: "group-hover:bg-logo-purple",
    borderAccent: "border-t-logo-purple",
  },
  {
    icon: Shield,
    title: "Safer Playground",
    description:
      "A fully fenced, child-safe outdoor playground where kids can run, climb, and play with confidence.",
    iconBg: "bg-logo-red/10",
    iconColor: "text-logo-red",
    hoverBg: "group-hover:bg-logo-red",
    borderAccent: "border-t-logo-red",
  },
  {
    icon: Clock,
    title: "Daycare & Aftercare",
    description:
      "Flexible daycare and aftercare programmes to support working parents, from early morning to late afternoon.",
    iconBg: "bg-logo-orange/10",
    iconColor: "text-logo-orange",
    hoverBg: "group-hover:bg-logo-orange",
    borderAccent: "border-t-logo-orange",
  },
  {
    icon: Monitor,
    title: "Computer Lessons",
    description:
      "Introduction to technology through guided computer lessons, giving children a head start in the digital world.",
    iconBg: "bg-logo-skyblue/10",
    iconColor: "text-logo-skyblue",
    hoverBg: "group-hover:bg-logo-skyblue",
    borderAccent: "border-t-logo-skyblue",
  },
  {
    icon: Palette,
    title: "English Medium Centre",
    description:
      "All instruction is delivered in English, building strong language and communication skills from an early age.",
    iconBg: "bg-logo-pink/10",
    iconColor: "text-logo-pink",
    hoverBg: "group-hover:bg-logo-pink",
    borderAccent: "border-t-logo-pink",
  },
  {
    icon: Baby,
    title: "Baby Care (0-2 Years)",
    description:
      "Specialized care for infants and toddlers in a warm, safe environment with trained caregivers.",
    iconBg: "bg-logo-yellow/20",
    iconColor: "text-logo-orange",
    hoverBg: "group-hover:bg-logo-yellow",
    borderAccent: "border-t-logo-yellow",
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="py-20 md:py-28 bg-muted">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-bold text-logo-blue uppercase tracking-wider">
            What We Offer
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-foreground text-balance">
            Our Services
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            From baby care to pre-school readiness, we provide a comprehensive
            range of early childhood development services.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <Card
              key={service.title}
              className={`group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-t-4 ${service.borderAccent} border-border/60`}
            >
              <CardHeader>
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${service.iconBg} ${service.iconColor} ${service.hoverBg} group-hover:text-white transition-colors`}>
                  <service.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-base font-bold">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
