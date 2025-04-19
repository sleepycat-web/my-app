"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/date-picker"
import { TimePicker } from "@/components/time-picker"
import { Sparkles, Loader2 } from "lucide-react"
import { AIEventSuggestions } from "@/components/ai-event-suggestions"

export default function CreateEventPage() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    date: undefined as Date | undefined,
    startTime: "",
    endTime: "",
    budget: "",
    guestCount: "",
    description: "",
  })

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const generateSuggestions = () => {
    if (!formData.type || !formData.guestCount) {
      alert("Please select an event type and enter guest count to get suggestions")
      return
    }

    setIsGenerating(true)

    // Simulate API call to AI service
    setTimeout(() => {
      setIsGenerating(false)
      setShowSuggestions(true)
    }, 2000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, we would save the event to the database
    router.push("/dashboard")
  }

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
                <CardDescription>Provide the basic information about your event</CardDescription>
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
                    <Select onValueChange={(value) => handleChange("type", value)} required>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="birthday">Birthday Party</SelectItem>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="corporate">Corporate Event</SelectItem>
                        <SelectItem value="conference">Conference</SelectItem>
                        <SelectItem value="social">Social Gathering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Event Date</Label>
                    <DatePicker onChange={(date) => handleChange("date", date)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <TimePicker value={formData.startTime} onChange={(time) => handleChange("startTime", time)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <TimePicker value={formData.endTime} onChange={(time) => handleChange("endTime", time)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget (INR)</Label>
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
                      onChange={(e) => handleChange("guestCount", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your event"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateSuggestions}
                  disabled={isGenerating || !formData.type || !formData.guestCount}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Get AI Suggestions
                    </>
                  )}
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  Create Event
                </Button>
              </CardFooter>
            </Card>
          </form>

          {showSuggestions && (
            <AIEventSuggestions
              eventType={formData.type}
              guestCount={formData.guestCount ? Number.parseInt(formData.guestCount, 10) : 0}
            />
          )}
        </div>
      </main>
    </div>
  )
}
