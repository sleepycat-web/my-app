import { DashboardHeader } from "@/components/dashboard-header"
import { CalendarView } from "@/components/calendar-view"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-muted-foreground mt-1">View and manage your events schedule</p>
          </div>
          <Button asChild className="mt-4 md:mt-0 bg-purple-600 hover:bg-purple-700">
            <Link href="/events/create">
              <Plus className="mr-2 h-4 w-4" /> Create New Event
            </Link>
          </Button>
        </div>

        <CalendarView />
      </main>
    </div>
  )
}
