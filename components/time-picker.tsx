"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  className?: string;
  placeholder?: string;
}

export function TimePicker({
  value,
  onChange,
  className,
  placeholder,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedHour, setSelectedHour] = React.useState<string | undefined>(
    value ? value.split(":")[0] : undefined
  );
  const [selectedMinute, setSelectedMinute] = React.useState<
    string | undefined
  >(value ? value.split(":")[1].split(" ")[0] : undefined);
  const [selectedPeriod, setSelectedPeriod] = React.useState<
    "AM" | "PM" | undefined
  >(value ? (value.includes("PM") ? "PM" : "AM") : undefined);

  // clear previous picks whenever user re-opens the picker
  React.useEffect(() => {
    if (open) {
      setSelectedHour(undefined);
      setSelectedMinute(undefined);
      setSelectedPeriod(undefined);
    }
  }, [open]);

  // auto‐confirm when all three are selected
  React.useEffect(() => {
    if (open && selectedHour && selectedMinute && selectedPeriod) {
      onConfirm();
    }
  }, [open, selectedHour, selectedMinute, selectedPeriod]);

  const hours = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 1;
    return hour.toString().padStart(2, "0");
  });

  const minutes = Array.from({ length: 12 }, (_, i) => {
    const minute = i * 5;
    return minute.toString().padStart(2, "0");
  });

  const handleHourChange = (hour: string) => {
    setSelectedHour(hour);
  };

  const handleMinuteChange = (minute: string) => {
    setSelectedMinute(minute);
  };

  const handlePeriodChange = (period: "AM" | "PM") => {
    setSelectedPeriod(period);
  };

  const formatTime = (h: string, m: string, p: "AM" | "PM") => `${h}:${m} ${p}`;

  const onConfirm = () => {
    if (onChange && selectedHour && selectedMinute && selectedPeriod) {
      onChange(formatTime(selectedHour, selectedMinute, selectedPeriod));
    }
    setOpen(false);
  };

  const displayTime = value
    ? value
    : selectedHour && selectedMinute && selectedPeriod
    ? formatTime(selectedHour, selectedMinute, selectedPeriod)
    : placeholder
    ? placeholder
    : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value &&
              (!selectedHour || !selectedMinute || !selectedPeriod) &&
              "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayTime}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="flex gap-2">
          <Select value={selectedHour} onValueChange={handleHourChange}>
            <SelectTrigger className="">
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
            <SelectTrigger className="">
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

          <Select
            value={selectedPeriod}
            onValueChange={(value) => handlePeriodChange(value as "AM" | "PM")}
          >
            <SelectTrigger className="">
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
  );
}
