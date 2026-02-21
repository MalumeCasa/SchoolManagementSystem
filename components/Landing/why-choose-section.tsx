import { Heart, Award, Clock, ShieldCheck, Sun, Users } from "lucide-react"

const reasons = [
  {
    icon: Heart,
    title: "Loving Environment",
    description: "A warm, nurturing space where every child feels safe, valued, and encouraged to be themselves.",
    iconBg: "bg-logo-pink/15",
    iconColor: "text-logo-pink",
  },
  {
    icon: Award,
    title: "Qualified Staff",
    description: "Our team of certified educators brings passion and expertise to early childhood development.",
    iconBg: "bg-logo-blue/15",
    iconColor: "text-logo-blue",
  },
  {
    icon: Clock,
    title: "Flexible Hours",
    description: "Convenient operating hours with daycare and aftercare options to suit working families.",
    iconBg: "bg-logo-orange/15",
    iconColor: "text-logo-orange",
  },
  {
    icon: ShieldCheck,
    title: "Safety First",
    description: "Fully fenced premises with controlled access and supervised play areas at all times.",
    iconBg: "bg-logo-red/15",
    iconColor: "text-logo-red",
  },
  {
    icon: Sun,
    title: "Outdoor Learning",
    description: "Beautiful outdoor spaces that encourage exploration, physical activity, and nature appreciation.",
    iconBg: "bg-logo-yellow/20",
    iconColor: "text-logo-orange",
  },
  {
    icon: Users,
    title: "Small Class Sizes",
    description: "Low teacher-to-child ratios ensure personalized attention for every learner.",
    iconBg: "bg-logo-green/15",
    iconColor: "text-logo-green",
  },
]

export function WhyChooseSection() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-bold text-logo-green uppercase tracking-wider">
            Why Parents Trust Us
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-foreground text-balance">
            Why Choose Kiddies Town?
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            We are committed to providing the highest quality early childhood
            education and care in a safe, loving environment.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason) => (
            <div key={reason.title} className="flex gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${reason.iconBg} ${reason.iconColor}`}>
                <reason.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">
                  {reason.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
