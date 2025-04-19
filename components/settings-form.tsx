"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Edit } from "lucide-react";

export function SettingsForm() {
  const [isEditing, setIsEditing] = useState(false); // start in view mode by default
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [signupDate, setSignupDate] = useState("");
  const [bio, setBio] = useState("");
  const [preferences, setPreferences] = useState({
    defaultLocation: "",
    defaultCurrency: "",
    defaultTimezone: "",
    aiSuggestions: true,
    mapsIntegration: true,
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    eventReminders: true,
    taskReminders: true,
    reminderTime: "1d",
  });
  const [initialBioEmpty, setInitialBioEmpty] = useState(false);
  const [initialPreferencesEmpty, setInitialPreferencesEmpty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("account");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/users/me", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const u = data.user;
      setUser(u);
      setName(u.name || "");
      setEmail(u.email || "");
      setSignupDate(new Date(u.signupDate).toLocaleDateString());
      setBio(u.bio || "");
      setInitialBioEmpty(!u.bio);
      setInitialPreferencesEmpty(!u.preferences);
      // enable edit-mode only on first login (no bio and no prefs)
      setIsEditing(!u.bio && !u.preferences);
      if (u.preferences) {
        setPreferences(u.preferences);
      } else {
        // first time, autofill via IP geolocation
        try {
          const geoRes = await fetch("https://ipapi.co/json/");
          if (geoRes.ok) {
            const geo = await geoRes.json();
            setPreferences({
              defaultLocation: `${geo.city}, ${geo.region}`,
              defaultCurrency: "inr",
              defaultTimezone: geo.timezone,
              aiSuggestions: true,
              mapsIntegration: true,
            });
          } else {
            setPreferences((prev) => ({ ...prev, defaultCurrency: "inr" }));
          }
        } catch {
          setPreferences((prev) => ({ ...prev, defaultCurrency: "inr" }));
        }
      }
      if (u.notifications) setNotifications(u.notifications);
      setIsLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const body: any = {};
    if (activeTab === "account") {
      body.name = name;
      body.bio = bio;
    }
    if (activeTab === "preferences") body.preferences = preferences;
    if (activeTab === "notifications") body.notifications = notifications;
    await fetch("/api/users/me", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    // update user and possibly advance tabs
    if (activeTab === "account" && initialBioEmpty) {
      setInitialBioEmpty(false);
      setActiveTab("preferences");
    }
    if (activeTab === "preferences" && initialPreferencesEmpty) {
      setInitialPreferencesEmpty(false);
      setActiveTab("notifications");
    }
    // clear initial locks after first save
    if (initialBioEmpty) setInitialBioEmpty(false);
    if (initialPreferencesEmpty) setInitialPreferencesEmpty(false);
    // always exit edit mode and reset to account
    setIsEditing(false);
    setActiveTab("account");
    setIsSaving(false);
  };

  // show Edit button as an icon in top-right
  return (
    <div>
      <Tabs
        defaultValue="account"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-8">
          <TabsList className="flex space-x-4">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="preferences" disabled={initialBioEmpty}>
              Preferences
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              disabled={initialPreferencesEmpty}
            >
              Notifications
            </TabsTrigger>
          </TabsList>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} readOnly />
              </div>

              <div className="space-y-2">
                <Label>Signup Date</Label>
                <Input value={signupDate} readOnly />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself"
                  value={bio}
                  onChange={(e) => isEditing && setBio(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
            <CardFooter>
              {isEditing && (
                <Button
                  onClick={handleSave}
                  className="bg-purple-600 hover:bg-purple-700"
                >
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
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Event Preferences</CardTitle>
              <CardDescription>
                Customize your event planning experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="default-location">Default Location</Label>
                <Input
                  id="default-location"
                  value={preferences.defaultLocation}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      defaultLocation: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-currency">Default Currency</Label>
                <Select
                  value={preferences.defaultCurrency}
                  onValueChange={(val) =>
                    setPreferences((prev) => ({
                      ...prev,
                      defaultCurrency: val,
                    }))
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger id="default-currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="gbp">GBP (£)</SelectItem>
                    <SelectItem value="cad">CAD ($)</SelectItem>
                    <SelectItem value="inr">INR (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-timezone">Default Timezone</Label>
                <Select
                  value={preferences.defaultTimezone}
                  onValueChange={(val) =>
                    setPreferences((prev) => ({
                      ...prev,
                      defaultTimezone: val,
                    }))
                  }
                  disabled={!isEditing}
                >
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
                  <p className="text-sm text-muted-foreground">
                    Allow AI to learn from your preferences
                  </p>
                </div>
                <Switch
                  id="ai-suggestions"
                  checked={preferences.aiSuggestions}
                  onCheckedChange={(val) =>
                    setPreferences((prev) => ({
                      ...prev,
                      aiSuggestions: val,
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maps-integration">
                    Google Maps Integration
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Use Google Maps for venue recommendations
                  </p>
                </div>
                <Switch
                  id="maps-integration"
                  checked={preferences.mapsIntegration}
                  onCheckedChange={(val) =>
                    setPreferences((prev) => ({
                      ...prev,
                      mapsIntegration: val,
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
            <CardFooter>
              {isEditing && (
                <Button
                  onClick={handleSave}
                  className="bg-purple-600 hover:bg-purple-700"
                >
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
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Control how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates and reminders via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.emailNotifications}
                  onCheckedChange={(val) =>
                    setNotifications((prev) => ({
                      ...prev,
                      emailNotifications: val,
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates and reminders via text message
                  </p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={notifications.smsNotifications}
                  onCheckedChange={(val) =>
                    setNotifications((prev) => ({
                      ...prev,
                      smsNotifications: val,
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="event-reminders">Event Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminders before your events
                  </p>
                </div>
                <Switch
                  id="event-reminders"
                  checked={notifications.eventReminders}
                  onCheckedChange={(val) =>
                    setNotifications((prev) => ({
                      ...prev,
                      eventReminders: val,
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="task-reminders">Task Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminders for upcoming tasks
                  </p>
                </div>
                <Switch
                  id="task-reminders"
                  checked={notifications.taskReminders}
                  onCheckedChange={(val) =>
                    setNotifications((prev) => ({
                      ...prev,
                      taskReminders: val,
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>

              {/* Reminder time selector */}
              <div className="space-y-2">
                <Label htmlFor="reminder-time">Default Reminder Time</Label>
                <Select
                  value={notifications.reminderTime}
                  onValueChange={(val) =>
                    setNotifications((prev) => ({ ...prev, reminderTime: val }))
                  }
                  disabled={!isEditing}
                >
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
              {isEditing && (
                <Button
                  onClick={handleSave}
                  className="bg-purple-600 hover:bg-purple-700"
                >
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
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
