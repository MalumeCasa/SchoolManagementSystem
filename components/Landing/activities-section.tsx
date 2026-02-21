import Image from "next/image"
import { Music, Theater, Dumbbell, Sparkles } from "lucide-react"

const activities = [
  {
    icon: Theater,
    title: "Drama",
    description:
      "Creative drama classes that build confidence, imagination, and self-expression through storytelling and role-play.",
    bgColor: "bg-logo-pink/15",
    iconColor: "text-logo-pink",
  },
  {
    icon: Music,
    title: "Dance Classes",
    description:
      "Fun and energetic dance lessons that develop coordination, rhythm, and teamwork in a joyful setting.",
    bgColor: "bg-logo-skyblue/15",
    iconColor: "text-logo-skyblue",
  },
  {
    icon: Dumbbell,
    title: "Sports",
    description:
      "Age-appropriate sports activities that promote physical fitness, motor skills, and a love for healthy living.",
    bgColor: "bg-logo-green/15",
    iconColor: "text-logo-green",
  },
  {
    icon: Sparkles,
    title: "Arts & Crafts",
    description:
      "Hands-on creative projects that develop fine motor skills, colour recognition, and artistic expression.",
    bgColor: "bg-logo-orange/15",
    iconColor: "text-logo-orange",
  },
]

export function ActivitiesSection() {
  return (
    <section id="activities" className="py-20 md:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div>
            <p className="text-sm font-bold text-logo-pink uppercase tracking-wider">
              Beyond The Classroom
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-foreground leading-tight text-balance">
              Extra Mural Activities
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              We believe in developing the whole child. Our extra mural
              programme goes beyond academics to nurture creativity, physical
              fitness, and social skills.
            </p>

            <div className="mt-10 grid sm:grid-cols-2 gap-6">
              {activities.map((activity) => (
                <div key={activity.title} className="flex gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${activity.bgColor} ${activity.iconColor}`}
                  >
                    <activity.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">
                      {activity.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-logo-green/20">
              <Image
                src="/playground.jpg"
                alt="Children enjoying playground activities at Kiddies Town"
                width={640}
                height={480}
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Decorative dots */}
            <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-logo-yellow/30 -z-10" />
            <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full bg-logo-pink/20 -z-10" />
          </div>
        </div>
      </div>
    </section>
  )
}
