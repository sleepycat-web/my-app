import { DashboardContent } from "@/components/dashboard-content"
import { DashboardHeader } from "@/components/dashboard-header"

export default function Home() {
  // In a real app, you would check authentication here
  // and redirect to login if not authenticated
  // For the MVP, we'll directly show the dashboard

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6">
        <DashboardContent />
      </main>
    </div>
  )
}
