import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check, MapPin, Clock, Users, CheckSquare } from "lucide-react";
import { VenueMapPlaceholder } from "@/components/venue-map-placeholder";

// Removed APIPlace interface as it's no longer needed as a prop

// Define the structure for a venue based on expected data
interface Venue {
  id: string;
  name: string;
  description: string; // Corresponds to formattedAddress or other details
  capacity?: number; // Capacity might not come from Places API directly
  priceRange?: string; // Price level might come from Places API
  // Add other relevant fields from the Places API response if needed
  // e.g., rating, userRatingCount, photos, etc.
}

interface AIEventSuggestionsProps {
  eventType: string;
  guestCount: number;
  // Removed apiPlaces prop
}

export function AIEventSuggestions({
  eventType,
  guestCount,
}: AIEventSuggestionsProps) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This would come from an AI API or be hardcoded/derived
  const suggestions = {
    // Removed hardcoded venues array
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
  };

  useEffect(() => {
    const fetchVenues = async () => {
      setIsLoading(true);
      setError(null);
      setVenues([]); // Clear previous venues

      try {
        // Construct the query for the Google Places API
        // Example: "wedding venue for 150 guests in [Location]"
        // You might need a location parameter as well for better results.
        const query = `${eventType} venue for ${guestCount} guests`; // Adjust query as needed

        // *** IMPORTANT SECURITY NOTE ***
        // Direct client-side calls to Google Places API with API keys are insecure.
        // Create an API route (e.g., /api/places) in your Next.js app.
        // This route will securely use your API key/token on the server-side
        // to call the Google Places API and return the results.

        // Replace '/api/places' with your actual API route endpoint
        const response = await fetch("/api/places", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: query }), // Send the constructed query
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        // --- Placeholder for API response processing ---
        // Assuming your API route '/api/places' returns an object like { places: [...] }
        // based on the Google Places API response structure you provided.
        if (data && data.places && Array.isArray(data.places)) {
          const formattedVenues: Venue[] = data.places.map((place: any) => ({
            // Adapt this mapping based on the actual fields returned by the Google Places API
            // and your '/api/places' endpoint.
            id: place.id,
            name:
              place.displayName?.text ||
              place.formattedAddress ||
              place.name ||
              "Unknown Venue", // Prefer displayName if available
            description: place.formattedAddress || "No address available",
            // Capacity and priceRange might not be directly available.
            // You might need additional logic or data sources for these.
            capacity: place.capacity || undefined, // Example: if capacity exists
            priceRange: place.priceLevel
              ? "$".repeat(place.priceLevel)
              : undefined, // Example: map priceLevel enum
          }));
          setVenues(formattedVenues);
        } else {
          // Handle cases where the API returns no places or unexpected format
          console.warn(
            "No places found or unexpected API response format:",
            data
          );
          setVenues([]); // Set to empty array if no valid places
        }
        // --- End Placeholder ---
      } catch (err) {
        console.error("Error fetching venues:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setVenues([]); // Clear venues on error
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch venues only if eventType and guestCount are provided
    if (eventType && guestCount > 0) {
      fetchVenues();
    } else {
      // Optionally clear venues or set a default state if inputs are missing
      setVenues([]);
      setIsLoading(false);
      setError(null);
    }

    // Dependency array: re-run the effect if eventType or guestCount changes
  }, [eventType, guestCount]);

  // Removed the apiPlaces processing logic

  const getEventTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      birthday: "Birthday Party",
      wedding: "Wedding",
      corporate: "Corporate Event",
      conference: "Conference",
      social: "Social Gathering",
    };
    return types[type] || type;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="text-purple-600 dark:text-purple-400 mr-2">
            AI Suggestions
          </span>
          for {getEventTypeLabel(eventType)} with {guestCount} guests
        </CardTitle>
        <CardDescription>
          Based on your event details, here are some personalized suggestions
        </CardDescription>
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
            {isLoading && <p>Loading venues...</p>}
            {error && (
              <p className="text-red-500">Error loading venues: {error}</p>
            )}
            {!isLoading && !error && venues.length === 0 && (
              <p>No venue suggestions found for your criteria.</p>
            )}
            {!isLoading &&
              !error &&
              venues.map((venue) => (
                <Card key={venue.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-purple-500" />
                          {venue.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {venue.description}
                        </p>
                        {/* Conditionally render capacity/price if available */}
                        {(venue.capacity || venue.priceRange) && (
                          <div className="flex items-center mt-2 text-sm">
                            {venue.capacity && (
                              <>
                                <Users className="h-4 w-4 mr-1" />
                                <span>Capacity: {venue.capacity}</span>
                              </>
                            )}
                            {venue.capacity && venue.priceRange && (
                              <span className="mx-2">•</span>
                            )}
                            {venue.priceRange && (
                              <span>Price: {venue.priceRange}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
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
                        <p className="text-sm text-muted-foreground">
                          {item.activity}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                  Use This Timeline
                </Button>
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
                        <p className="text-sm text-muted-foreground">
                          Due: {task.dueDate}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                  Add These Tasks
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
