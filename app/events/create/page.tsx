"use client";

import type React from "react";
import Image from "next/image"; // Import Next.js Image component

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
import { Sparkles, Loader2, Star, Phone } from "lucide-react";

// Define a type for the photo object within the place result
interface PlacePhoto {
  name: string; // Resource name, e.g., "places/{place_id}/photos/{photo_reference}"
  // Add other photo metadata fields if needed (widthPx, heightPx, authorAttributions)
}

// Define a type for the place result for better type safety
interface PlaceSearchResult {
  id: string;
  formattedAddress: string;
  displayName?: {
    text: string;
    languageCode: string;
  };
  rating?: number; // Add rating field
  nationalPhoneNumber?: string; // Add phone number field
  photos?: PlacePhoto[]; // Add photos field (contains metadata)
  // Add other fields you might need from the API response based on your field mask
}

export default function CreateEventPage() {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false); // State for search loading
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]); // State for search results
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null); // State for selected venue ID
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submission loading
  const [userEmail, setUserEmail] = useState<string | null>(null); // State for user email

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    date: undefined as Date | undefined,
    startTime: "",
    endTime: "",
    budget: "",
    guestCount: "",
    location: "", // Location for search
    manualVenue: "", // New field for manual venue entry
    description: "",
  });
  // user currency preference
  const [currency, setCurrency] = useState<string>("INR");

  // Remove the getLocationPhotoRef function and related useEffect hooks previously here

  useEffect(() => {
    fetch("/api/users/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.preferences?.currency) {
          setCurrency(data.user.preferences.currency);
        }
        if (data.user?.email) { // Add this check
          setUserEmail(data.user.email); // Store the email
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
    // If manual venue is being changed (meaning it's visible and user is typing),
    // ensure selected venue ID is cleared. This should only happen if selectedVenueId was already null.
    if (field === "manualVenue" && value.trim() !== "") {
      // This check might be redundant now due to conditional rendering, but safe to keep.
      if (selectedVenueId) {
        setSelectedVenueId(null);
      }
    }
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
    setSelectedVenueId(null); // Reset selection on new search

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
          // Specify desired fields including rating, phone number, and photos
          fields:
            "places.id,places.displayName,places.formattedAddress,places.rating,places.nationalPhoneNumber,places.photos",
          maxResultCount: 20, // Limit results for display
        }),
      });
      console.log("Response from API:", response);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search for places");
      }

      const data = await response.json();
      // Sort results by rating descending (handle undefined ratings)
      const sortedPlaces = (data.places || [])
        .filter(
          (place: PlaceSearchResult) =>
            place.displayName && place.formattedAddress
        ) // Filter out places missing essential info
        .sort(
          (a: PlaceSearchResult, b: PlaceSearchResult) =>
            (b.rating ?? 0) - (a.rating ?? 0)
        );
      setSearchResults(sortedPlaces); // Update results, ensuring it's an array
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

  // Function to handle venue selection
  const handleSelectVenue = (venueId: string) => {
    const isSelecting = selectedVenueId !== venueId;
    const newSelectedVenueId = isSelecting ? venueId : null;
    setSelectedVenueId(newSelectedVenueId); // Toggle selection

    // If selecting a venue, clear the manual venue input (it will be hidden anyway)
    // If deselecting, manualVenue remains as it was (likely empty).
    if (isSelecting) {
      setFormData((prev) => ({ ...prev, manualVenue: "" }));
      // Optionally clear location as well, though it's hidden when selected
      // setFormData((prev) => ({ ...prev, location: "", manualVenue: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isTimeInvalid) return;
    // // Check if search was performed and if a venue is selected - Removed this check to allow manual entry
    // if (searchResults.length > 0 && !selectedVenueId && !formData.manualVenue) {
    //   alert("Please select a venue from the suggestions or enter one manually.");
    //   return;
    // }

    setIsSubmitting(true);

    // Ensure user email is available
    if (!userEmail) {
      alert("User email not found. Please ensure you are logged in.");
      setIsSubmitting(false);
      return;
    }

    let venueString = "";
    if (formData.manualVenue.trim()) {
      // Prioritize manual venue input
      venueString = formData.manualVenue.trim();
    } else if (selectedVenueId) {
      // Use selected venue if no manual input
      const selectedVenue = searchResults.find((p) => p.id === selectedVenueId);
      if (selectedVenue) {
        venueString = `${selectedVenue.displayName?.text || "Venue"}, ${
          selectedVenue.formattedAddress
        }`;
        if (selectedVenue.nationalPhoneNumber) {
          venueString += `, Phone: ${selectedVenue.nationalPhoneNumber}`;
        }
      } else {
        // Fallback if selectedVenueId is somehow invalid, though unlikely
        venueString = formData.location;
      }
    } else {
      // Fallback to location if neither manual nor selected venue exists
      venueString = formData.location;
    }

    const eventData = {
      email: userEmail, // Include the user's email
      eventName: formData.name,
      date: formData.date ? formData.date.toLocaleDateString('en-US', { // Example formatting, adjust as needed
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) : "",
      startTime: formData.startTime,
      endTime: formData.endTime,
      details: {
        venue: venueString,
        type: formData.type,
        guests: formData.guestCount ? `${formData.guestCount} people` : "",
        budget: formData.budget ? `${currency} ${formData.budget}` : "",
        description: formData.description,
      },
      timeline: [], // Empty timeline
      tasks: [],    // Empty tasks
      name: formData.name, // As per requested format
    };

    console.log("Submitting Event Data:", eventData);

    try {
      // Make the actual API call to POST /api/events
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || 'Failed to create event');
      }

      const result = await response.json();
      console.log('Event created:', result);

      alert("Event created successfully!");
      router.push("/"); // Redirect after successful submission
    } catch (error) {
      console.error("Error creating event:", error);
      alert(
        `Failed to create event: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  }; // <-- Added missing closing brace for handleSubmit

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
                {/* ... other form fields (name, type, date, time, budget, guests) ... */}
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

                {/* Conditional Rendering for Venue/Location Inputs vs Selected Venue Card */}
                {!selectedVenueId ? (
                  <>
                    {/* Show Inputs when no venue is selected */}
                    <div className="space-y-2">
                      <Label htmlFor="location">
                        Location (for Venue Search)
                      </Label>
                      <Input
                        id="location"
                        placeholder="Enter the location"
                        value={formData.location}
                        onChange={(e) =>
                          handleChange("location", e.target.value)
                        }
                        required // Keep required for search functionality
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manualVenue">
                        Venue Name & Address (Optional)
                      </Label>
                      <Input
                        id="manualVenue"
                        placeholder="Enter venue name and address if known, or select from suggestions below"
                        value={formData.manualVenue}
                        onChange={(e) =>
                          handleChange("manualVenue", e.target.value)
                        }
                        // No longer needs disabled attribute here
                      />
                      {/* <p className="text-xs text-muted-foreground">
                        Or use 'Get AI Suggestions' based on location.
                      </p> */}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Show Selected Venue Card when a venue is selected */}
                    {(() => {
                      // Find the selected venue once
                      const selectedVenue = searchResults.find(
                        (p) => p.id === selectedVenueId
                      );
                      if (!selectedVenue) return null; // Return null if not found (shouldn't happen ideally)

                      return (
                        <Card className="bg-purple-50 border border-purple-200 shadow-sm">
                          <CardHeader className="relative flex flex-row items-center justify-between py-2 px-4">
                            <CardTitle className="text-sm font-semibold text-purple-800 leading-none">
                              Selected Venue
                            </CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-purple-600 hover:bg-purple-100 hover:text-purple-800"
                              // Pass the actual ID to handleSelectVenue for deselection
                              onClick={() => handleSelectVenue(selectedVenueId)}
                            >
                              Clear
                            </Button>
                          </CardHeader>
                          <CardContent className="text-purple-700 px-4 pb-3 space-y-1">
                            <p className="font-medium text-sm leading-tight">
                              {selectedVenue.displayName?.text ||
                                "Venue Name Unavailable"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {selectedVenue.formattedAddress}
                            </p>
                            {selectedVenue.nationalPhoneNumber && (
                              <p className="text-xs text-blue-500 flex items-center pt-0.5">
                                <Phone className="w-3 h-3 mr-1.5 flex-shrink-0" />
                                {selectedVenue.nationalPhoneNumber}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })()}
                  </>
                )}

                {/* Description Input */}
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
                {/* Search Venues button */}
                <div className="flex flex-col items-start">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSearchVenues}
                    disabled={
                      isSearching ||
                      !formData.type ||
                      !formData.guestCount ||
                      !formData.location || // Disable search if location is empty
                      !!selectedVenueId // Also disable if a venue is selected (location input is hidden)
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
                  {!selectedVenueId && ( // Only show hint if inputs are visible
                    <p className="text-xs text-muted-foreground mt-1">
                      Requires Type, Guests, and Location.
                    </p>
                  )}
                </div>
                {/* Create Event Button */}
                <Button
                  type="submit"
                  disabled={isTimeInvalid || isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Event"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>

          {/* Display Selected Venue Info - MOVED INSIDE FORM CARD */}
          {/* {selectedVenueId && ... } */}

          {/* Display Search Results */}
          {(isSearching || searchResults.length > 0) && (
            <Card className="mb-8">
              {/* ... existing search results rendering ... */}
              <CardHeader>
                <CardTitle>Venue Suggestions</CardTitle>
                <CardDescription>
                  Based on your event details and location. Click one to select.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSearching ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2">Loading suggestions...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <ul className="space-y-4">
                    {searchResults.map((place) => {
                      // Get photo reference directly from search results
                      const photoName = place.photos?.[0]?.name;
                      const photoUrl = photoName
                        ? `/api/places/photos?photoReference=${encodeURIComponent(
                            photoName
                          )}`
                        : null;
                      // Use state for loading, although direct rendering might suffice
                      // For simplicity, we'll assume loading is handled by the Image component itself or skip explicit loading state here
                      // If complex loading state per image is needed, useState/useEffect could be reintroduced here.

                      return (
                        // Use the provided JSX structure
                        <li
                          key={place.id}
                          className={`border rounded-md shadow-sm overflow-hidden cursor-pointer transition-all duration-200 ease-in-out ${
                            // Added transition
                            selectedVenueId === place.id
                              ? "border-purple-500 ring-2 ring-purple-300 ring-offset-2 bg-neutral-100 dark:bg-neutral-800" // Enhanced highlight
                              : "border-border hover:shadow-md hover:border-gray-300" // Hover effect for non-selected
                          }`}
                          onClick={() => handleSelectVenue(place.id)} // Use new handler
                        >
                          {photoUrl ? (
                            <div className="relative w-full h-48">
                              <Image
                                src={photoUrl}
                                alt={place.displayName?.text || "Venue image"}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Example sizes, adjust as needed
                                style={{ objectFit: "cover" }}
                                priority // Consider removing if many images load initially
                                // Add onError handler if needed
                                // onError={() => console.warn(`Failed to load image: ${photoUrl}`)}
                              />
                            </div>
                          ) : (
                            // Fallback if no photo reference exists
                            <div className="relative w-full h-24 bg-slate-100 flex items-center justify-center">
                              <p className="text-sm text-muted-foreground">
                                No image available
                              </p>
                            </div>
                          )}

                          <div className="p-4">
                            <p className="font-semibold text-lg mb-1">
                              {place.displayName?.text || "Unnamed Place"}
                            </p>
                            <p className="text-sm text-muted-foreground mb-2">
                              {place.formattedAddress}
                            </p>

                            <div className="flex items-center space-x-4 text-sm mb-2">
                              {place.rating !== undefined && (
                                <span className="flex items-center text-amber-500">
                                  <Star
                                    className="w-4 h-4 mr-1"
                                    fill="currentColor"
                                  />
                                  {place.rating.toFixed(1)}
                                </span>
                              )}
                              {place.nationalPhoneNumber && (
                                <span className="flex items-center text-muted-foreground">
                                  <Phone className="w-4 h-4 mr-1" />
                                  {place.nationalPhoneNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
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
