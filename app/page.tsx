import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold">Welcome to EduManage</h1>
     <Button asChild className="mt-6">
        <Link href="/home">Go to Home</Link>
      </Button>      
    </div>
  )
}
