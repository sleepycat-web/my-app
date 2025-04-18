"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save } from "lucide-react"

export function SettingsForm() {
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("account")

  const handleSave = () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  return (
    <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 mb-8">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="preferences">Preferences</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue="John Doe" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue="john.doe@example.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself"
                defaultValue="Event planner with 5 years of experience organizing corporate events and social gatherings."
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="preferences">
        <Card>
          <CardHeader>
            <CardTitle>Event Preferences</CardTitle>
            <CardDescription>Customize your event planning experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="default-location">Default Location</Label>
              <Input id="default-location" defaultValue="New York, NY" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-currency">Default Currency</Label>
              <Select defaultValue="usd">
                <SelectTrigger id="default-currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="gbp">GBP (£)</SelectItem>
                  <SelectItem value="cad">CAD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-timezone">Default Timezone</Label>
              <Select defaultValue="est">
                <SelectTrigger id="default-timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="est">Eastern Time (ET)</SelectItem>
                  <SelectItem value="cst">Central Time (CT)</SelectItem>
                  <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                  <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ai-suggestions">AI Suggestions</Label>
                <p className="text-sm text-muted-foreground">Allow AI to learn from your preferences</p>
              </div>
              <Switch id="ai-suggestions" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maps-integration">Google Maps Integration</Label>
                <p className="text-sm text-muted-foreground">Use Google Maps for venue recommendations</p>
              </div>
              <Switch id="maps-integration" defaultChecked />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Control how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates and reminders via email</p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates and reminders via text message</p>
              </div>
              <Switch id="sms-notifications" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="event-reminders">Event Reminders</Label>
                <p className="text-sm text-muted-foreground">Get reminders before your events</p>
              </div>
              <Switch id="event-reminders" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="task-reminders">Task Reminders</Label>
                <p className="text-sm text-muted-foreground">Get reminders for upcoming tasks</p>
              </div>
              <Switch id="task-reminders" defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-time">Default Reminder Time</Label>
              <Select defaultValue="1d">
                <SelectTrigger id="reminder-time">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30m">30 minutes before</SelectItem>
                  <SelectItem value="1h">1 hour before</SelectItem>
                  <SelectItem value="3h">3 hours before</SelectItem>
                  <SelectItem value="1d">1 day before</SelectItem>
                  <SelectItem value="3d">3 days before</SelectItem>
                  <SelectItem value="1w">1 week before</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Notification Settings
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
