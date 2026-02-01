"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  currentDate: string; // ISO date string (YYYY-MM-DD)
}

export function DatePicker({ currentDate }: DatePickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const date = parseISO(currentDate);

  function handleDateSelect(newDate: Date | undefined) {
    if (!newDate) return;

    const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", format(newDate, "yyyy-MM-dd"));
    params.set("tz", userTz);
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal sm:w-[280px]"
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {format(date, "do MMM yyyy")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
