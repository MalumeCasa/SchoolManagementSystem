import Image from "next/image"

export function GallerySection() {
  return (
    <section id="gallery" className="py-20 md:py-28 bg-muted">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-bold text-logo-purple uppercase tracking-wider">
            See Our School
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-foreground text-balance">
            Life at Kiddies Town
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Take a look at the happy moments, creative activities, and vibrant
            learning that happens every day at our academy.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="rounded-2xl overflow-hidden shadow-md row-span-2 ring-2 ring-logo-orange/20">
            <Image
              src="/enrolment.png"
              alt="Kiddies Town ECD registration flyer showing services and activities"
              width={400}
              height={600}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="rounded-2xl overflow-hidden shadow-md ring-2 ring-logo-blue/20">
            <Image
              src="/hero-children.jpg"
              alt="Children learning together in the classroom"
              width={400}
              height={300}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="rounded-2xl overflow-hidden shadow-md ring-2 ring-logo-green/20">
            <Image
              src="/classroom.jpg"
              alt="Bright and colorful classroom environment"
              width={400}
              height={300}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="rounded-2xl overflow-hidden shadow-md col-span-2 ring-2 ring-logo-pink/20">
            <Image
              src="/playground.jpg"
              alt="Safe outdoor playground area"
              width={800}
              height={400}
              className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
