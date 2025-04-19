"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [events, setEvents] = useState<any[]>([]);

  // fetch events from API on mount
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        setEvents(Array.isArray(data.events) ? data.events : []);
      } catch (err) {
        console.error("Failed to load events", err);
      }
    }
    fetchEvents();
  }, []);

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get first day of the month and total days in month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Previous and next month navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // replace fixed month navigators with dynamic period navigation
  const goToPrevious = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    } else if (viewMode === "week") {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    }
  };
  const goToNext = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    } else if (viewMode === "week") {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    }
  };

  // Get events for the current month (parse stored date strings)
  const eventsThisMonth = events
    .map((e) => ({ ...e, date: new Date(e.date) }))
    .filter(
      (e) =>
        e.date.getMonth() === currentMonth &&
        e.date.getFullYear() === currentYear
    );

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
  ];
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="h-24 border border-gray-200 dark:border-gray-800 p-1"
        ></div>
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const eventsOnDay = eventsThisMonth.filter(
        (event) => event.date.getDate() === day
      );

      days.push(
        <div
          key={`day-${day}`}
          className={`h-24 border border-gray-200 dark:border-gray-800 p-1 ${
            date.toDateString() === new Date().toDateString()
              ? "bg-purple-50 dark:bg-purple-900/20"
              : ""
          }`}
        >
          <div className="flex justify-between items-start">
            <span
              className={`text-sm font-medium ${
                date.toDateString() === new Date().toDateString()
                  ? "text-purple-600 dark:text-purple-400"
                  : ""
              }`}
            >
              {day}
            </span>
          </div>
          <div className="mt-1 space-y-1">
            {eventsThisMonth
              .filter((evt) => evt.date.getDate() === day)
              .map((event) => (
                <Link
                  href={`/events/${event._id}`}
                  key={event._id}
                  className="block text-xs p-1 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 truncate hover:bg-purple-200 dark:hover:bg-purple-800/60"
                >
                  {event.eventName}
                </Link>
              ))}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-0">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center py-2 font-medium text-sm text-muted-foreground"
          >
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const generateWeekView = () => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const current = new Date(currentDate);
    const start = new Date(current);
    start.setDate(current.getDate() - current.getDay());
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
    const eventsWithDate = events.map((e) => ({
      ...e,
      date: new Date(e.date),
    }));
    return (
      <div className="mb-6">
        <div className="grid grid-cols-7 text-center border-b">
          {days.map((d) => (
            <div key={d.toDateString()} className="py-2 font-medium">
              <div>{dayNames[d.getDay()]}</div>
              <div className="mt-1">{d.getDate()}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d) => {
            const dayEvents = eventsWithDate.filter(
              (e) => e.date.toDateString() === d.toDateString()
            );
            return (
              <div key={d.toDateString()} className="min-h-[8rem] border p-1">
                {dayEvents.map((ev) => (
                  <Link
                    href={`/events/${ev._id}`}
                    key={ev._id}
                    className="block text-xs p-1 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 truncate mb-1"
                  >
                    {ev.eventName}
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const generateDayView = () => {
    const dateEvents = events
      .map((e) => ({ ...e, date: new Date(e.date) }))
      .filter((e) => e.date.toDateString() === currentDate.toDateString());
    return (
      <div className="mb-6">
        {/* removed duplicate date header */}
        {dateEvents.length > 0 ? (
          <div className="space-y-2">
            {dateEvents.map((ev) => (
              <Link
                href={`/events/${ev._id}`}
                key={ev._id}
                className="flex justify-between items-center p-3 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300"
              >
                <div>
                  <p className="font-medium">{ev.eventName}</p>
                  <p className="text-sm text-muted-foreground">
                    {ev.date.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    • {ev.details.venue}
                  </p>
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                  {ev.type}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            No events for this day.
          </p>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* common header for month/week/day */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Button variant="outline" size="icon" onClick={goToPrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold mx-4">
              {viewMode === "month"
                ? `${monthNames[currentMonth]} ${currentYear}`
                : viewMode === "week"
                ? `Week of ${startOfWeek.toLocaleDateString()}`
                : currentDate.toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
            </h2>
            <Button variant="outline" size="icon" onClick={goToNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Select
            value={viewMode}
            onValueChange={(v) => setViewMode(v as "month" | "week" | "day")}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {viewMode === "month" && generateCalendarDays()}
        {viewMode === "week" && generateWeekView()}
        {viewMode === "day" && generateDayView()}

        <div className="mt-6">
          <h3 className="font-medium mb-3">All Events</h3>
          <div className="space-y-2">
            {events
              .map((e) => ({ ...e, date: new Date(e.date) }))
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map((event) => (
                <Link
                  href={`/events/${event._id}`}
                  key={event._id}
                  className="flex justify-between items-center p-3 rounded-md border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <div>
                    <p className="font-medium">{event.eventName}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.date.toLocaleDateString()} • {event.details.venue}
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
  );
}
