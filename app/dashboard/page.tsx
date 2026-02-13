import Link from "next/link";
import { format, parseISO } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWorkoutsForDate } from "@/data/workouts";
import { Button } from "@/components/ui/button";
import { DatePicker } from "./date-picker";
import { TimezoneRedirect } from "./timezone-redirect";

interface DashboardPageProps {
  searchParams: Promise<{ date?: string; tz?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const dateString = params.date || format(new Date(), "yyyy-MM-dd");
  const timezone = params.tz;
  const date = parseISO(dateString);

  // If no timezone, render client component that will redirect with timezone
  if (!timezone) {
    return <TimezoneRedirect currentDate={dateString} />;
  }

  const workouts = await getWorkoutsForDate(date, timezone);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workout Log</h1>
        <Button asChild>
          <Link href="/dashboard/workout/new">New Workout</Link>
        </Button>
      </div>

      <div className="mb-8">
        <DatePicker currentDate={dateString} />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Workouts for {format(date, "do MMM yyyy")}
        </h2>

        {workouts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No workouts logged for this date.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {workouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">
                      {workout.name || "Workout"}
                    </CardTitle>
                    {workout.duration && (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                        {formatDuration(workout.duration)}
                      </span>
                    )}
                  </div>
                  {workout.notes && (
                    <CardDescription>{workout.notes}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {workout.workoutExercises.length > 0 && (
                    <ul className="space-y-2 text-sm">
                      {workout.workoutExercises.map((we) => (
                        <li key={we.id} className="flex items-start justify-between">
                          <span className="font-medium">{we.exercise.name}</span>
                          <span className="text-muted-foreground">
                            {formatExerciseSummary(we.sets)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

function formatExerciseSummary(
  sets: Array<{
    reps: number | null;
    weight: number | null;
    weightUnit: string | null;
  }>
): string {
  if (sets.length === 0) return "";

  const completedSets = sets.filter((s) => s.reps !== null);
  if (completedSets.length === 0) return `${sets.length} sets`;

  const maxWeight = Math.max(...completedSets.map((s) => s.weight || 0));
  const totalReps = completedSets.reduce((sum, s) => sum + (s.reps || 0), 0);
  const unit = completedSets[0]?.weightUnit || "lbs";

  if (maxWeight > 0) {
    return `${completedSets.length} sets, ${totalReps} reps @ ${maxWeight} ${unit}`;
  }
  return `${completedSets.length} sets, ${totalReps} reps`;
}
