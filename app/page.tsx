import { Navbar } from "@components/Landing/navbar"
import { HeroSection } from "@components/Landing/hero-section"
import { StatsBanner } from "@components/Landing/stats-banner"
import { AboutSection } from "@components/Landing/about-section"
import { ServicesSection } from "@components/Landing/services-section"
import { ActivitiesSection } from "@components/Landing/activities-section"
import { WhyChooseSection } from "@components/Landing/why-choose-section"
import { GallerySection } from "@components/Landing/gallery-section"
import { TestimonialsSection } from "@components/Landing/testimonials-section"
import { EnrolSection } from "@components/Landing/enrol-section"
import { ContactSection } from "@components/Landing/contact-section"
import { Footer } from "@components/Landing/footer"

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <StatsBanner />
      <AboutSection />
      <ServicesSection />
      <ActivitiesSection />
      <WhyChooseSection />
      <GallerySection />
      <TestimonialsSection />
      <EnrolSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
