import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Check, MapPin, Clock, Users, CheckSquare } from "lucide-react"
import { VenueMapPlaceholder } from "@/components/venue-map-placeholder"

interface AIEventSuggestionsProps {
  eventType: string
  guestCount: number
}

export function AIEventSuggestions({ eventType, guestCount }: AIEventSuggestionsProps) {
  // This would come from an AI API in a real implementation
  const suggestions = {
    venues: [
      {
        id: "v1",
        name: "Grand Ballroom",
        description: "Elegant venue with modern amenities",
        capacity: 200,
        priceRange: "$$$",
      },
      {
        id: "v2",
        name: "Garden Terrace",
        description: "Beautiful outdoor space with garden views",
        capacity: 100,
        priceRange: "$$",
      },
      {
        id: "v3",
        name: "Urban Loft",
        description: "Industrial chic space in downtown",
        capacity: 150,
        priceRange: "$$$",
      },
    ],
    timeline: [
      { time: "2:00 PM", activity: "Setup and decoration" },
      { time: "4:00 PM", activity: "Guests arrival" },
      { time: "4:30 PM", activity: "Welcome drinks" },
      { time: "5:30 PM", activity: "Main event" },
      { time: "7:00 PM", activity: "Dinner service" },
      { time: "9:00 PM", activity: "Entertainment" },
      { time: "11:00 PM", activity: "Event conclusion" },
    ],
    tasks: [
      { id: "t1", name: "Book venue", dueDate: "8 weeks before" },
      { id: "t2", name: "Send invitations", dueDate: "6 weeks before" },
      { id: "t3", name: "Arrange catering", dueDate: "4 weeks before" },
      { id: "t4", name: "Confirm guest list", dueDate: "2 weeks before" },
      { id: "t5", name: "Finalize decorations", dueDate: "1 week before" },
      { id: "t6", name: "Prepare welcome packages", dueDate: "3 days before" },
    ],
  }

  const getEventTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      birthday: "Birthday Party",
      wedding: "Wedding",
      corporate: "Corporate Event",
      conference: "Conference",
      social: "Social Gathering",
    }
    return types[type] || type
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="text-purple-600 dark:text-purple-400 mr-2">AI Suggestions</span>
          for {getEventTypeLabel(eventType)} with {guestCount} guests
        </CardTitle>
        <CardDescription>Based on your event details, here are some personalized suggestions</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="venues" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="venues">Venues</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="venues" className="space-y-4">
            <div
              className="mb-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800"
              style={{ height: "200px" }}
            >
              <VenueMapPlaceholder />
            </div>
            {suggestions.venues.map((venue) => (
              <Card key={venue.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-purple-500" />
                        {venue.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{venue.description}</p>
                      <div className="flex items-center mt-2 text-sm">
                        <Users className="h-4 w-4 mr-1" />
                        <span>Capacity: {venue.capacity}</span>
                        <span className="mx-2">•</span>
                        <span>Price: {venue.priceRange}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Check className="h-4 w-4 mr-1" /> Select
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardContent className="p-4">
                <ul className="space-y-4">
                  {suggestions.timeline.map((item, index) => (
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
                <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">Use This Timeline</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardContent className="p-4">
                <ul className="space-y-3">
                  {suggestions.tasks.map((task) => (
                    <li key={task.id} className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                          <CheckSquare className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="font-medium">{task.name}</p>
                        <p className="text-sm text-muted-foreground">Due: {task.dueDate}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">Add These Tasks</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
