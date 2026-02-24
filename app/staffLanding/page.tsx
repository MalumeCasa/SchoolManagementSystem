import { Navbar } from "@components/Landing/navbar"
import  CompleteTeam  from '@components/Landing/staff-landing'
import { Footer } from "@components/Landing/footer"


export default function Home() {
  return (
    <main>
      <Navbar />
      <CompleteTeam />
      <Footer />
    </main>
  )
}
