import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Lerato M.",
    role: "Parent of 2",
    quote:
      "Kiddies Town has been a blessing for our family. My children love going to school every day, and the teachers are incredibly caring and professional.",
    stars: 5,
    avatarBg: "bg-logo-blue",
  },
  {
    name: "Thabo N.",
    role: "Parent",
    quote:
      "The progress my daughter has made since joining is amazing. She can already read simple words and count to 100. The NCF curriculum really works!",
    stars: 5,
    avatarBg: "bg-logo-green",
  },
  {
    name: "Sarah V.",
    role: "Parent",
    quote:
      "I love the flexible aftercare hours. As a working mom, knowing my son is safe and learning even after school gives me great peace of mind.",
    stars: 5,
    avatarBg: "bg-logo-orange",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-bold text-logo-orange uppercase tracking-wider">
            What Parents Say
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-foreground text-balance">
            Trusted by Families in Polokwane
          </h2>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.name}
              className="p-6 hover:shadow-lg transition-shadow border-b-4 border-b-logo-blue/30"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: testimonial.stars }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-logo-yellow text-logo-yellow"
                  />
                ))}
              </div>
              <blockquote className="mt-4 text-sm text-muted-foreground leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="mt-5 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${testimonial.avatarBg} text-white font-bold text-sm`}>
                  {testimonial.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
