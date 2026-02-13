import { db } from '@/src';
import { workouts, workoutExercises, exercises, sets } from '@/src/db/schema';
import { eq, and, gte, lt } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { fromZonedTime } from 'date-fns-tz';

export async function getWorkoutsForDate(date: Date, timezone: string = 'UTC') {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Create start and end of day in user's timezone, then convert to UTC for DB query
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Start of day in user's timezone (00:00:00) converted to UTC
  const startOfDay = fromZonedTime(new Date(year, month, day, 0, 0, 0, 0), timezone);
  // End of day in user's timezone (23:59:59.999) converted to UTC
  const endOfDay = fromZonedTime(new Date(year, month, day, 23, 59, 59, 999), timezone);

  // Fetch workouts for the user on the given date with related data
  const result = await db.query.workouts.findMany({
    where: and(
      eq(workouts.userId, userId),
      gte(workouts.startedAt, startOfDay),
      lt(workouts.startedAt, endOfDay)
    ),
    with: {
      workoutExercises: {
        orderBy: (workoutExercises, { asc }) => [asc(workoutExercises.orderIndex)],
        with: {
          exercise: true,
          sets: {
            orderBy: (sets, { asc }) => [asc(sets.setNumber)],
          },
        },
      },
    },
    orderBy: (workouts, { desc }) => [desc(workouts.startedAt)],
  });

  return result;
}

export async function createWorkout(data: { name: string; notes?: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const [workout] = await db
    .insert(workouts)
    .values({
      userId,
      name: data.name,
      notes: data.notes,
    })
    .returning();

  return workout;
}

export async function getWorkoutById(workoutId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const result = await db.query.workouts.findFirst({
    where: and(
      eq(workouts.id, workoutId),
      eq(workouts.userId, userId),
    ),
  });

  return result;
}

export async function updateWorkout(workoutId: number, data: { name: string; notes?: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const [workout] = await db
    .update(workouts)
    .set({
      name: data.name,
      notes: data.notes,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId),
      )
    )
    .returning();

  return workout;
}

export type WorkoutWithDetails = Awaited<ReturnType<typeof getWorkoutsForDate>>[number];
