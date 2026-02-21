import Image from "next/image"
import { CheckCircle2 } from "lucide-react"

const highlights = [
  { text: "Qualified and caring teachers", color: "text-logo-blue" },
  { text: "English medium of instruction", color: "text-logo-green" },
  { text: "NCF ELDA curriculum themes", color: "text-logo-orange" },
  { text: "Safe and secure environment", color: "text-logo-red" },
  { text: "Children aged 0-6 years welcome", color: "text-logo-pink" },
  { text: "Small class sizes for individual attention", color: "text-logo-skyblue" },
]

export function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-logo-yellow/30">
              <Image
                src="/classroom.jpg"
                alt="Kiddies Town colorful classroom"
                width={640}
                height={480}
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-6 -right-4 md:right-4 bg-card rounded-xl shadow-lg p-4 border border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-logo-green text-white font-bold text-lg">
                  15+
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Years of</p>
                  <p className="text-xs text-muted-foreground">
                    Trusted Childcare
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-sm font-bold text-logo-orange uppercase tracking-wider">
              About Our School
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-foreground leading-tight text-balance">
              Nurturing Young Minds Since Day One
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              At Kiddies Town ECD and Academy, we believe every child deserves
              the best start in life. Our dedicated team of qualified teachers
              creates a warm, stimulating environment where children can explore,
              learn, and grow at their own pace.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Located in the heart of Ster Park, Polokwane, our academy
              combines structured classroom learning with creative play,
              ensuring your child is fully prepared for formal schooling.
            </p>

            <ul className="mt-8 grid sm:grid-cols-2 gap-3">
              {highlights.map((item) => (
                <li key={item.text} className="flex items-start gap-2.5">
                  <CheckCircle2 className={`h-5 w-5 shrink-0 mt-0.5 ${item.color}`} />
                  <span className="text-sm font-medium text-foreground">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
