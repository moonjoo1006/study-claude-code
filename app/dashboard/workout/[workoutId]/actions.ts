"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { updateWorkout } from "@/data/workouts";

const updateWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  name: z.string().min(1).max(200),
  notes: z.string().max(1000).optional(),
});

export async function updateWorkoutAction(params: {
  workoutId: number;
  name: string;
  notes?: string;
}) {
  const validated = updateWorkoutSchema.parse(params);
  await updateWorkout(validated.workoutId, {
    name: validated.name,
    notes: validated.notes,
  });
  revalidatePath("/dashboard");
}
