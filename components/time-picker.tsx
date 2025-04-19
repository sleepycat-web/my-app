"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TimePickerProps {
  value?: string
  onChange?: (time: string) => void
  className?: string
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [selectedHour, setSelectedHour] = React.useState<string>(value ? value.split(":")[0] : "12")
  const [selectedMinute, setSelectedMinute] = React.useState<string>(value ? value.split(":")[1].split(" ")[0] : "00")
  const [selectedPeriod, setSelectedPeriod] = React.useState<"AM" | "PM">(
    value ? (value.includes("PM") ? "PM" : "AM") : "AM",
  )

  const hours = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 1
    return hour.toString().padStart(2, "0")
  })

  const minutes = Array.from({ length: 12 }, (_, i) => {
    const minute = i * 5
    return minute.toString().padStart(2, "0")
  })

  const handleHourChange = (hour: string) => {
    setSelectedHour(hour)
    updateTime(hour, selectedMinute, selectedPeriod)
  }

  const handleMinuteChange = (minute: string) => {
    setSelectedMinute(minute)
    updateTime(selectedHour, minute, selectedPeriod)
  }

  const handlePeriodChange = (period: "AM" | "PM") => {
    setSelectedPeriod(period)
    updateTime(selectedHour, selectedMinute, period)
  }

  const updateTime = (hour: string, minute: string, period: "AM" | "PM") => {
    if (onChange) {
      onChange(`${hour}:${minute} ${period}`)
    }
  }

  const displayTime = value || `${selectedHour}:${selectedMinute} ${selectedPeriod}`

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground", className)}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayTime}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="flex gap-2">
          <Select value={selectedHour} onValueChange={handleHourChange}>
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="Hour" />
            </SelectTrigger>
            <SelectContent>
              {hours.map((hour) => (
                <SelectItem key={hour} value={hour}>
                  {hour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMinute} onValueChange={handleMinuteChange}>
            <SelectTrigger className="w-[75px]">
              <SelectValue placeholder="Minute" />
            </SelectTrigger>
            <SelectContent>
              {minutes.map((minute) => (
                <SelectItem key={minute} value={minute}>
                  {minute}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPeriod} onValueChange={(value) => handlePeriodChange(value as "AM" | "PM")}>
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="AM/PM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AM">AM</SelectItem>
              <SelectItem value="PM">PM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  )
}
