import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays,
  MapPin,
  Clock,
  CheckSquare,
  Edit,
  Users,
} from "lucide-react";
import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { DeleteEventButton } from "@/components/delete-event-button";

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { db } = await connectToDatabase();
  const event = await db
    .collection("Events")
    .findOne({ _id: new ObjectId(params.id) });
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Event not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">{event.eventName}</h1>
              <div className="flex items-center text-muted-foreground mt-1">
                <CalendarDays className="h-4 w-4 mr-1" /> {event.date}
              </div>
            </div>
            <div className="flex space-x-2 mt-4 md:mt-0">
              <Button asChild>
                <Link href={`/events/${event._id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" /> Edit Event
                </Link>
              </Button>
              <DeleteEventButton eventId={event._id.toString()} />
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Venue
                    </h3>
                    <p className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      {event.details.venue}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Time Slot
                    </h3>
                    <p className="mt-1">
                      {event.startTime} - {event.endTime}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Guests
                    </h3>
                    <p className="flex items-center mt-1">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                      {event.details.guests || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Type
                    </h3>
                    <p className="mt-1 capitalize">{event.details.type}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Budget
                    </h3>
                    <p className="mt-1">{event.details.budget}</p>
                  </div>
                </div>
              </div>

              {event.details.description && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Description
                  </h3>
                  <p className="mt-1">{event.details.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Event Timeline</CardTitle>
                  <CardDescription>
                    Schedule for the day of the event
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {event.timeline.map((item: any, index: number) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                            <Clock className="h-4 w-4" />
                          </div>
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="font-medium">{item.time}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.action}
                          </p>
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
                  <CardDescription>
                    Things to do before the event
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {event.tasks.map((task: any, index: number) => (
                      <li key={index} className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${
                              task.status === "completed"
                                ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300"
                                : "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300"
                            }`}
                          >
                            <CheckSquare className="h-4 w-4" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium`}>
                            {task.title} {/* Changed from task.name */}
                          </p>
                          {/* Add display for description */}
                          {task.description && (
                            <p className="text-sm text-muted-foreground">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
