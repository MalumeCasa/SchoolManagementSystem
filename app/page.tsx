import { Container } from "@/components/Container";
import { Hero } from "@/components/Hero";
import { SectionTitle } from "@/components/SectionTitle";
import { Benefits } from "@/components/Benefits";
import { Video } from "@/components/Video";
import { Testimonials } from "@/components/Testimonials";
import { Faq } from "@/components/Faq";
import { Cta } from "@/components/Cta";

import { benefitOne, benefitTwo } from "@/components/data";
export default function Home() {
  return (
    <Container>
      <Hero />
      <SectionTitle
        preTitle="About Us"
        title=" Why should you choose Kiddies Town ECD and Academy?"
      >
        <div>
          <div>
            <h1>Headline:</h1>  
            <p>
              A Home Away from Home for Your Little Ones
              At Kiddies Town ECD Academy, we provide high-quality early childhood care and education for babies, toddlers, and preschoolers (0-6 years).
            </p>
            <p>
              Our safe, stimulating environment helps children grow socially, emotionally, and cognitively through play-based learning.
              Located in Sterpark, Polokwane — convenient for working parents.
            </p>

          </div>
          
          <div>
            <h1>Highlight:</h1> 
            <p>
              Fun events, birthday celebrations, pyjama days, graduation ceremonies, and aftercare services.
            </p>
          </div>
          
     

        </div>
        </SectionTitle>

      <Benefits data={benefitOne} />
      <Benefits imgPos="right" data={benefitTwo} />

      <SectionTitle
        preTitle="Access Our Platform"
        title="Learn how to use Our Services"
      >
        We have created a video to show you how to use our services and what to expect when you enroll your child at Kiddies Town ECD and Academy. We hope this video will give you a better understanding of our services and how we can help you and your child.
      </SectionTitle>

      <Video videoId="fZ0D0cnR88E" />

      <SectionTitle
        preTitle="Testimonials"
        title="Here's what our parents said"
      >
        We are proud to have been a part of their early childhood journey and are grateful for the kind words they have shared about their experience with us. Their testimonials reflect our commitment to providing a nurturing and enriching environment for every child at Kiddies Town ECD and Academy.
      </SectionTitle>

      <Testimonials />

      <SectionTitle preTitle="FAQ" title="Frequently Asked Questions">
        Here are some random questions you may need clearity on before you enroll your child at Kiddies Town ECD and Academy. If you have any other question, please don&apos;t hesitate to contact us.
      </SectionTitle>

      <Faq />
      <Cta />
    </Container>
  );
}
