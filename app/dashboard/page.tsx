"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const mockWorkouts = [
  {
    id: "1",
    name: "Fran",
    description: "21-15-9 Thrusters (95/65 lb) and Pull-ups",
    time: "3:45",
    type: "For Time",
  },
  {
    id: "2",
    name: "Back Squat",
    description: "5x5 @ 80% 1RM",
    weight: "275 lb",
    type: "Strength",
  },
  {
    id: "3",
    name: "EMOM 12",
    description: "Min 1: 12 Cal Row, Min 2: 10 Burpees",
    type: "Conditioning",
  },
]

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date())

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Workout Log</h1>

      <div className="mb-8">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal sm:w-[280px]",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 size-4" />
              {date ? format(date, "do MMM yyyy") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Workouts for {format(date, "do MMM yyyy")}
        </h2>

        {mockWorkouts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No workouts logged for this date.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {mockWorkouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{workout.name}</CardTitle>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                      {workout.type}
                    </span>
                  </div>
                  <CardDescription>{workout.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {workout.time && (
                    <p className="text-sm">
                      <span className="font-medium">Time:</span> {workout.time}
                    </p>
                  )}
                  {workout.weight && (
                    <p className="text-sm">
                      <span className="font-medium">Weight:</span>{" "}
                      {workout.weight}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
