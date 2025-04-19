"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/date-picker";
import { TimePicker } from "@/components/time-picker";
import { Sparkles, Loader2 } from "lucide-react";

// Define a type for the place result for better type safety
interface PlaceSearchResult {
  id: string;
  formattedAddress: string;
  displayName?: {
    text: string;
    languageCode: string;
  };
  // Add other fields you might need from the API response based on your field mask
}

export default function CreateEventPage() {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false); // State for search loading
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]); // State for search results

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    date: undefined as Date | undefined,
    startTime: "",
    endTime: "",
    budget: "",
    guestCount: "",
    location: "", // Add location field
    description: "",
  });
  // user currency preference
  const [currency, setCurrency] = useState<string>("INR");

  useEffect(() => {
    fetch("/api/users/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.preferences?.currency) {
          setCurrency(data.user.preferences.currency);
        }
      })
      .catch(console.error);
  }, []);

  // validate time order
  const isTimeInvalid: boolean =
    !!formData.startTime &&
    !!formData.endTime &&
    isTimeBefore(formData.endTime, formData.startTime);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // utility to compare “hh:mm AM/PM” times
  function isTimeBefore(t1: string, t2: string): boolean {
    const toMinutes = (t: string) => {
      const [hms, period] = t.split(" ");
      const [h, m] = hms.split(":").map(Number);
      const h24 = (h % 12) + (period === "PM" ? 12 : 0);
      return h24 * 60 + m;
    };
    return toMinutes(t1) < toMinutes(t2);
  }

  // Function to handle venue search
  const handleSearchVenues = async () => {
    if (!formData.type || !formData.guestCount || !formData.location) {
      alert(
        "Please select event type, enter guest count, and specify a location to search for venues."
      );
      return;
    }

    setIsSearching(true);
    setSearchResults([]); // Clear previous results

    try {
      // Construct a query for the Places API
      const textQuery = `${formData.type} venue for ${formData.guestCount} guests near ${formData.location}`;

      const response = await fetch("/api/places/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          textQuery,
          // Specify desired fields to reduce cost and data transfer
          fields: "places.id,places.displayName,places.formattedAddress",
          maxResultCount: 20, // Limit results for display
        }),
      });
console.log("Response from API:", response);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search for places");
      }

      const data = await response.json();
      setSearchResults(data.places || []); // Update results, ensuring it's an array
    } catch (error) {
      console.error("Error searching for venues:", error);
      alert(
        `Error searching for venues: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setSearchResults([]); // Clear results on error
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would save the event to the database
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Create New Event</h1>

          <form onSubmit={handleSubmit}>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>
                  Provide the basic information about your event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Event Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter event name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Event Type</Label>
                    <Select
                      onValueChange={(value) => handleChange("type", value)}
                      required
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="birthday">Birthday Party</SelectItem>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="corporate">
                          Corporate Event
                        </SelectItem>
                        <SelectItem value="conference">Conference</SelectItem>
                        <SelectItem value="social">Social Gathering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Event Date</Label>
                    <DatePicker
                      onChange={(date) => handleChange("date", date)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <TimePicker
                      value={formData.startTime}
                      placeholder="Select start time"
                      onChange={(time) => handleChange("startTime", time)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <TimePicker
                      value={formData.endTime}
                      placeholder="Select end time"
                      onChange={(time) => handleChange("endTime", time)}
                    />
                    {isTimeInvalid && (
                      <p className="text-sm text-red-600">
                        End time cannot be before start time
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget ({currency})</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="Enter budget"
                      value={formData.budget}
                      onChange={(e) => handleChange("budget", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guestCount">Number of Guests</Label>
                    <Input
                      id="guestCount"
                      type="number"
                      placeholder="Enter guest count"
                      value={formData.guestCount}
                      onChange={(e) =>
                        handleChange("guestCount", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                {/* Add Location Input */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location (City or Area)</Label>
                  <Input
                    id="location"
                    placeholder="e.g., San Francisco, CA or near downtown"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your event"
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-start flex-wrap gap-4">
                {/* Replace AI Suggestions button with Search Venues button */}
                <div className="flex flex-col items-start">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSearchVenues}
                    disabled={
                      isSearching ||
                      !formData.type ||
                      !formData.guestCount ||
                      !formData.location
                    }
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching Venues...
                      </>
                    ) : (
                      "Get AI Suggestions"
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Requires Type, Guests, and Location.
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={isTimeInvalid || isSearching} // Disable create if searching
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Create Event
                </Button>
              </CardFooter>
            </Card>
          </form>

          {/* Display Search Results */}
          {(isSearching || searchResults.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Venue Suggestions</CardTitle>
                <CardDescription>
                  Based on your event details and location.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSearching ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2">Loading suggestions...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <ul className="space-y-3">
                    {searchResults.map((place) => (
                      <li key={place.id} className="border p-3 rounded-md">
                        <p className="font-semibold">
                          {place.displayName?.text || "Unnamed Place"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {place.formattedAddress}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  // This case might not be reached if the section is only shown when length > 0 after loading
                  <p>No venues found matching your criteria.</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
