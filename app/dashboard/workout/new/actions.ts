"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(200),
  notes: z.string().max(1000).optional(),
});

export async function createWorkoutAction(params: {
  name: string;
  notes?: string;
}) {
  const validated = createWorkoutSchema.parse(params);
  await createWorkout(validated);
  revalidatePath("/dashboard");
}
