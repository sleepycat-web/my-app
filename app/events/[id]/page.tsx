import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, MapPin, Users, Clock, CheckSquare, Edit } from "lucide-react"
import Link from "next/link"

export default function EventDetailPage({ params }: { params: { id: string } }) {
  // In a real app, we would fetch this data from an API
  const event = {
    id: params.id,
    name: "Company Holiday Party",
    date: "December 15, 2025",
    venue: "Grand Ballroom",
    address: "123 Main St, New York, NY",
    guests: 75,
    type: "corporate",
    budget: "$5,000",
    description: "Annual company holiday celebration with dinner, drinks, and entertainment.",
    timeline: [
      { time: "6:00 PM", activity: "Arrival & Welcome Drinks" },
      { time: "7:00 PM", activity: "Dinner Service" },
      { time: "8:30 PM", activity: "CEO Speech" },
      { time: "9:00 PM", activity: "Entertainment & Dancing" },
      { time: "11:00 PM", activity: "Event Conclusion" },
    ],
    tasks: [
      { id: "t1", name: "Confirm final headcount", completed: true },
      { id: "t2", name: "Send reminder to guests", completed: true },
      { id: "t3", name: "Finalize menu with caterer", completed: false },
      { id: "t4", name: "Arrange transportation", completed: false },
      { id: "t5", name: "Prepare welcome packages", completed: false },
    ],
    guests: [
      { id: "g1", name: "John Smith", email: "john@example.com", status: "confirmed" },
      { id: "g2", name: "Jane Doe", email: "jane@example.com", status: "confirmed" },
      { id: "g3", name: "Bob Johnson", email: "bob@example.com", status: "pending" },
      { id: "g4", name: "Alice Williams", email: "alice@example.com", status: "declined" },
    ],
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">{event.name}</h1>
              <div className="flex items-center text-muted-foreground mt-1">
                <CalendarDays className="h-4 w-4 mr-1" /> {event.date}
              </div>
            </div>
            <Button asChild className="mt-4 md:mt-0">
              <Link href={`/events/${event.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit Event
              </Link>
            </Button>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Venue</h3>
                    <p className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      {event.venue}
                    </p>
                    <p className="text-sm text-muted-foreground ml-5">{event.address}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Guests</h3>
                    <p className="flex items-center mt-1">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                      {event.guests} people
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                    <p className="mt-1 capitalize">{event.type}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Budget</h3>
                    <p className="mt-1">{event.budget}</p>
                  </div>
                </div>
              </div>

              {event.description && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  <p className="mt-1">{event.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="guests">Guest List</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Event Timeline</CardTitle>
                  <CardDescription>Schedule for the day of the event</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {event.timeline.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                            <Clock className="h-4 w-4" />
                          </div>
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="font-medium">{item.time}</p>
                          <p className="text-sm text-muted-foreground">{item.activity}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks">
              <Card>
                <CardHeader>
                  <CardTitle>Task List</CardTitle>
                  <CardDescription>Things to do before the event</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {event.tasks.map((task) => (
                      <li key={task.id} className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${
                              task.completed
                                ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300"
                                : "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300"
                            }`}
                          >
                            <CheckSquare className="h-4 w-4" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                            {task.name}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guests">
              <Card>
                <CardHeader>
                  <CardTitle>Guest List</CardTitle>
                  <CardDescription>People invited to your event</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2">Name</th>
                          <th className="text-left py-3 px-2">Email</th>
                          <th className="text-left py-3 px-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {event.guests.map((guest) => (
                          <tr key={guest.id} className="border-b">
                            <td className="py-3 px-2">{guest.name}</td>
                            <td className="py-3 px-2">{guest.email}</td>
                            <td className="py-3 px-2">
                              <span
                                className={`inline-block px-2 py-1 rounded-full text-xs ${
                                  guest.status === "confirmed"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : guest.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                }`}
                              >
                                {guest.status.charAt(0).toUpperCase() + guest.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
