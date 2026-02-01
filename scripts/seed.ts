import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { exercises, workouts, workoutExercises, sets } from '../src/db/schema';
import { eq } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const USER_ID = 'user_38y34fyvqQCQTLjkbYeoME62b9H';

async function seed() {
  console.log('Seeding database...');

  // Insert exercises
  console.log('Inserting exercises...');
  const insertedExercises = await db.insert(exercises).values([
    {
      name: 'Back Squat',
      description: 'Barbell squat with bar on upper back',
      type: 'strength',
      primaryMuscleGroup: 'quads',
      secondaryMuscleGroup: 'glutes',
      equipment: 'barbell',
      instructions: 'Place bar on upper traps, squat to parallel, drive up through heels',
      isCustom: 0,
    },
    {
      name: 'Deadlift',
      description: 'Conventional barbell deadlift',
      type: 'strength',
      primaryMuscleGroup: 'back',
      secondaryMuscleGroup: 'hamstrings',
      equipment: 'barbell',
      instructions: 'Grip bar shoulder width, hinge at hips, keep back flat, drive through floor',
      isCustom: 0,
    },
    {
      name: 'Pull-ups',
      description: 'Strict pull-up from dead hang',
      type: 'strength',
      primaryMuscleGroup: 'back',
      secondaryMuscleGroup: 'biceps',
      equipment: 'bodyweight',
      instructions: 'Hang from bar, pull chin over bar, lower with control',
      isCustom: 0,
    },
    {
      name: 'Push Press',
      description: 'Overhead press with leg drive',
      type: 'strength',
      primaryMuscleGroup: 'shoulders',
      secondaryMuscleGroup: 'triceps',
      equipment: 'barbell',
      instructions: 'Dip knees slightly, drive bar overhead using leg momentum',
      isCustom: 0,
    },
    {
      name: 'Box Jumps',
      description: 'Explosive jump onto box',
      type: 'plyometric',
      primaryMuscleGroup: 'quads',
      secondaryMuscleGroup: 'calves',
      equipment: 'box',
      instructions: 'Stand facing box, jump and land softly with both feet, step down',
      isCustom: 0,
    },
    {
      name: 'Rowing',
      description: 'Concept2 rowing for cardio',
      type: 'cardio',
      primaryMuscleGroup: 'full_body',
      equipment: 'rower',
      instructions: 'Drive with legs, lean back, pull handle to chest, reverse sequence',
      isCustom: 0,
    },
  ]).returning();

  console.log(`Inserted ${insertedExercises.length} exercises`);

  // Create a map of exercise names to IDs
  const exerciseMap = new Map(insertedExercises.map(e => [e.name, e.id]));

  // Insert workouts
  console.log('Inserting workouts...');
  const insertedWorkouts = await db.insert(workouts).values([
    {
      userId: USER_ID,
      name: 'Leg Day',
      notes: 'Focus on squat depth',
      startedAt: new Date('2026-01-27T08:00:00Z'),
      completedAt: new Date('2026-01-27T09:15:00Z'),
      duration: 75,
    },
    {
      userId: USER_ID,
      name: 'Pull Day',
      notes: 'Back and biceps emphasis',
      startedAt: new Date('2026-01-28T07:30:00Z'),
      completedAt: new Date('2026-01-28T08:45:00Z'),
      duration: 75,
    },
    {
      userId: USER_ID,
      name: 'Full Body WOD',
      notes: 'CrossFit metcon style',
      startedAt: new Date('2026-01-29T17:00:00Z'),
      completedAt: new Date('2026-01-29T18:00:00Z'),
      duration: 60,
    },
  ]).returning();

  console.log(`Inserted ${insertedWorkouts.length} workouts`);

  // Create a map of workout names to IDs
  const workoutMap = new Map(insertedWorkouts.map(w => [w.name, w.id]));

  // Insert workout exercises
  console.log('Inserting workout exercises...');
  const insertedWorkoutExercises = await db.insert(workoutExercises).values([
    // Leg Day
    {
      workoutId: workoutMap.get('Leg Day')!,
      exerciseId: exerciseMap.get('Back Squat')!,
      orderIndex: 1,
      notes: 'Warm up with empty bar first',
      targetSets: 5,
      targetReps: 5,
      targetWeight: 225,
      targetWeightUnit: 'lbs',
    },
    {
      workoutId: workoutMap.get('Leg Day')!,
      exerciseId: exerciseMap.get('Box Jumps')!,
      orderIndex: 2,
      notes: '24 inch box',
      targetSets: 3,
      targetReps: 10,
    },
    // Pull Day
    {
      workoutId: workoutMap.get('Pull Day')!,
      exerciseId: exerciseMap.get('Deadlift')!,
      orderIndex: 1,
      notes: 'Build up to working weight',
      targetSets: 5,
      targetReps: 5,
      targetWeight: 315,
      targetWeightUnit: 'lbs',
    },
    {
      workoutId: workoutMap.get('Pull Day')!,
      exerciseId: exerciseMap.get('Pull-ups')!,
      orderIndex: 2,
      notes: 'Strict, no kipping',
      targetSets: 4,
      targetReps: 8,
    },
    // Full Body WOD
    {
      workoutId: workoutMap.get('Full Body WOD')!,
      exerciseId: exerciseMap.get('Push Press')!,
      orderIndex: 1,
      notes: 'Part of the metcon',
      targetSets: 3,
      targetReps: 10,
      targetWeight: 95,
      targetWeightUnit: 'lbs',
    },
    {
      workoutId: workoutMap.get('Full Body WOD')!,
      exerciseId: exerciseMap.get('Rowing')!,
      orderIndex: 2,
      notes: '500m intervals',
      targetSets: 3,
    },
  ]).returning();

  console.log(`Inserted ${insertedWorkoutExercises.length} workout exercises`);

  // Create a map for workout exercises by workout name and exercise name
  const weMap = new Map<string, number>();
  for (const we of insertedWorkoutExercises) {
    const workout = insertedWorkouts.find(w => w.id === we.workoutId);
    const exercise = insertedExercises.find(e => e.id === we.exerciseId);
    if (workout && exercise) {
      weMap.set(`${workout.name}:${exercise.name}`, we.id);
    }
  }

  // Insert sets
  console.log('Inserting sets...');
  const setsData = [
    // Back Squat sets (Leg Day)
    { weKey: 'Leg Day:Back Squat', setNumber: 1, reps: 5, weight: 185, weightUnit: 'lbs', rir: 3, rpe: 7.0, restTime: 180, notes: 'Warm-up set' },
    { weKey: 'Leg Day:Back Squat', setNumber: 2, reps: 5, weight: 205, weightUnit: 'lbs', rir: 2, rpe: 8.0, restTime: 180 },
    { weKey: 'Leg Day:Back Squat', setNumber: 3, reps: 5, weight: 225, weightUnit: 'lbs', rir: 1, rpe: 8.5, restTime: 180, notes: 'Hit target' },
    { weKey: 'Leg Day:Back Squat', setNumber: 4, reps: 5, weight: 225, weightUnit: 'lbs', rir: 1, rpe: 9.0, restTime: 180 },
    { weKey: 'Leg Day:Back Squat', setNumber: 5, reps: 5, weight: 225, weightUnit: 'lbs', rir: 0, rpe: 9.5, notes: 'Last rep was a grinder' },

    // Box Jump sets (Leg Day)
    { weKey: 'Leg Day:Box Jumps', setNumber: 1, reps: 10, rpe: 6.0, restTime: 90 },
    { weKey: 'Leg Day:Box Jumps', setNumber: 2, reps: 10, rpe: 7.0, restTime: 90 },
    { weKey: 'Leg Day:Box Jumps', setNumber: 3, reps: 10, rpe: 7.5 },

    // Deadlift sets (Pull Day)
    { weKey: 'Pull Day:Deadlift', setNumber: 1, reps: 5, weight: 225, weightUnit: 'lbs', rir: 4, rpe: 6.0, restTime: 180, notes: 'Warm-up' },
    { weKey: 'Pull Day:Deadlift', setNumber: 2, reps: 5, weight: 275, weightUnit: 'lbs', rir: 2, rpe: 7.5, restTime: 180 },
    { weKey: 'Pull Day:Deadlift', setNumber: 3, reps: 5, weight: 315, weightUnit: 'lbs', rir: 1, rpe: 8.5, restTime: 180, notes: 'PR attempt' },
    { weKey: 'Pull Day:Deadlift', setNumber: 4, reps: 5, weight: 315, weightUnit: 'lbs', rir: 0, rpe: 9.0, restTime: 180 },
    { weKey: 'Pull Day:Deadlift', setNumber: 5, reps: 4, weight: 315, weightUnit: 'lbs', rir: 0, rpe: 10.0, notes: 'Missed 5th rep' },

    // Pull-up sets (Pull Day)
    { weKey: 'Pull Day:Pull-ups', setNumber: 1, reps: 8, rir: 2, rpe: 7.0, restTime: 120 },
    { weKey: 'Pull Day:Pull-ups', setNumber: 2, reps: 8, rir: 1, rpe: 8.0, restTime: 120 },
    { weKey: 'Pull Day:Pull-ups', setNumber: 3, reps: 7, rir: 0, rpe: 9.0, restTime: 120, notes: 'Failed last rep' },
    { weKey: 'Pull Day:Pull-ups', setNumber: 4, reps: 6, rir: 0, rpe: 9.5, notes: 'Fatigued' },

    // Push Press sets (Full Body WOD)
    { weKey: 'Full Body WOD:Push Press', setNumber: 1, reps: 10, weight: 95, weightUnit: 'lbs', rpe: 7.0, restTime: 60 },
    { weKey: 'Full Body WOD:Push Press', setNumber: 2, reps: 10, weight: 95, weightUnit: 'lbs', rpe: 8.0, restTime: 60 },
    { weKey: 'Full Body WOD:Push Press', setNumber: 3, reps: 10, weight: 95, weightUnit: 'lbs', rpe: 8.5, notes: 'Unbroken' },

    // Rowing sets (Full Body WOD)
    { weKey: 'Full Body WOD:Rowing', setNumber: 1, duration: 102, distance: 500, distanceUnit: 'm', rpe: 7.0, restTime: 120, notes: '1:42 pace' },
    { weKey: 'Full Body WOD:Rowing', setNumber: 2, duration: 105, distance: 500, distanceUnit: 'm', rpe: 8.0, restTime: 120, notes: '1:45 pace' },
    { weKey: 'Full Body WOD:Rowing', setNumber: 3, duration: 110, distance: 500, distanceUnit: 'm', rpe: 9.0, notes: '1:50 pace, gassed' },
  ];

  const setsToInsert = setsData.map(s => ({
    workoutExerciseId: weMap.get(s.weKey)!,
    setNumber: s.setNumber,
    reps: s.reps,
    weight: s.weight,
    weightUnit: s.weightUnit,
    rir: s.rir,
    rpe: s.rpe,
    duration: s.duration,
    distance: s.distance,
    distanceUnit: s.distanceUnit,
    restTime: s.restTime,
    notes: s.notes,
    completed: 1,
  }));

  const insertedSets = await db.insert(sets).values(setsToInsert).returning();
  console.log(`Inserted ${insertedSets.length} sets`);

  console.log('\nSeed completed successfully!');
  console.log('Summary:');
  console.log(`  - Exercises: ${insertedExercises.length}`);
  console.log(`  - Workouts: ${insertedWorkouts.length}`);
  console.log(`  - Workout Exercises: ${insertedWorkoutExercises.length}`);
  console.log(`  - Sets: ${insertedSets.length}`);
}

seed().catch(console.error);