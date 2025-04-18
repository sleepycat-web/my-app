"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

// Mock data for events
const mockEvents = [
  {
    id: "1",
    name: "Company Holiday Party",
    date: new Date(2025, 11, 15), // December 15, 2025
    venue: "Grand Ballroom",
    type: "corporate",
  },
  {
    id: "2",
    name: "Sarah's Birthday",
    date: new Date(2025, 7, 12), // August 12, 2025
    venue: "Backyard",
    type: "birthday",
  },
  {
    id: "3",
    name: "Team Building Workshop",
    date: new Date(2025, 5, 22), // June 22, 2025
    venue: "Conference Center",
    type: "corporate",
  },
  {
    id: "4",
    name: "Product Launch",
    date: new Date(2025, 8, 5), // September 5, 2025
    venue: "Tech Hub",
    type: "corporate",
  },
]

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month")

  // Get current month and year
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get first day of the month and total days in month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  // Previous and next month navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  // Get events for the current month
  const eventsThisMonth = mockEvents.filter(
    (event) => event.date.getMonth() === currentMonth && event.date.getFullYear() === currentYear,
  )

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = []
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200 dark:border-gray-800 p-1"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const eventsOnDay = eventsThisMonth.filter((event) => event.date.getDate() === day)

      days.push(
        <div
          key={`day-${day}`}
          className={`h-24 border border-gray-200 dark:border-gray-800 p-1 ${
            date.toDateString() === new Date().toDateString() ? "bg-purple-50 dark:bg-purple-900/20" : ""
          }`}
        >
          <div className="flex justify-between items-start">
            <span
              className={`text-sm font-medium ${
                date.toDateString() === new Date().toDateString() ? "text-purple-600 dark:text-purple-400" : ""
              }`}
            >
              {day}
            </span>
          </div>
          <div className="mt-1 space-y-1">
            {eventsOnDay.map((event) => (
              <Link
                href={`/events/${event.id}`}
                key={event.id}
                className="block text-xs p-1 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 truncate hover:bg-purple-200 dark:hover:bg-purple-800/60"
              >
                {event.name}
              </Link>
            ))}
          </div>
        </div>,
      )
    }

    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold mx-4">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Select value={viewMode} onValueChange={(value: "month" | "week" | "day") => setViewMode(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-7 gap-0">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center py-2 font-medium text-sm text-muted-foreground">
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    )
  }

  // Generate week view (simplified for MVP)
  const generateWeekView = () => {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Week view will be implemented in the next version.</p>
      </div>
    )
  }

  // Generate day view (simplified for MVP)
  const generateDayView = () => {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Day view will be implemented in the next version.</p>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        {viewMode === "month" && generateCalendarDays()}
        {viewMode === "week" && generateWeekView()}
        {viewMode === "day" && generateDayView()}

        <div className="mt-6">
          <h3 className="font-medium mb-3">Upcoming Events</h3>
          <div className="space-y-2">
            {mockEvents
              .filter((event) => event.date >= new Date())
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .slice(0, 3)
              .map((event) => (
                <Link
                  href={`/events/${event.id}`}
                  key={event.id}
                  className="flex justify-between items-center p-3 rounded-md border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <div>
                    <p className="font-medium">{event.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.date.toLocaleDateString()} • {event.venue}
                    </p>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                    {event.type}
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
