import { pgTable, text, integer, timestamp, pgEnum, real, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// ENUMS
// ============================================================================

export const exerciseTypeEnum = pgEnum('exercise_type', [
  'strength',
  'cardio',
  'flexibility',
  'balance',
  'plyometric',
  'other'
]);

export const equipmentEnum = pgEnum('equipment', [
  'barbell',
  'dumbbell',
  'kettlebell',
  'machine',
  'cable',
  'bodyweight',
  'resistance_band',
  'medicine_ball',
  'box',
  'rower',
  'bike',
  'treadmill',
  'other',
  'none'
]);

export const muscleGroupEnum = pgEnum('muscle_group', [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'abs',
  'obliques',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
  'full_body',
  'cardio'
]);

// ============================================================================
// TABLE 1: EXERCISES (Master Exercise Library)
// ============================================================================

export const exercises = pgTable('exercises', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),

  // Exercise Details
  name: text('name').notNull(),
  description: text('description'),
  type: exerciseTypeEnum('type').notNull().default('strength'),
  primaryMuscleGroup: muscleGroupEnum('primary_muscle_group').notNull(),
  secondaryMuscleGroup: muscleGroupEnum('secondary_muscle_group'),
  equipment: equipmentEnum('equipment').notNull().default('bodyweight'),

  // Instructions
  instructions: text('instructions'),
  videoUrl: text('video_url'),

  // Metadata
  isCustom: integer('is_custom').notNull().default(0), // 0 = global, 1 = custom
  createdBy: text('created_by'), // Clerk user ID if custom exercise

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Indexes for performance
  nameIdx: index('exercises_name_idx').on(table.name),
  typeIdx: index('exercises_type_idx').on(table.type),
  muscleGroupIdx: index('exercises_muscle_group_idx').on(table.primaryMuscleGroup),
  createdByIdx: index('exercises_created_by_idx').on(table.createdBy),
}));

// ============================================================================
// TABLE 2: WORKOUTS (Workout Sessions)
// ============================================================================

export const workouts = pgTable('workouts', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),

  // User Relationship (Clerk User ID)
  userId: text('user_id').notNull(),

  // Workout Details
  name: text('name'), // Optional: "Morning Session", "Leg Day", etc.
  notes: text('notes'), // Optional notes about the workout

  // Timestamps
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }), // Null = in progress

  // Duration (calculated or manually entered, in seconds)
  duration: integer('duration'), // Seconds

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Indexes for performance
  userIdIdx: index('workouts_user_id_idx').on(table.userId),
  startedAtIdx: index('workouts_started_at_idx').on(table.startedAt),
  completedAtIdx: index('workouts_completed_at_idx').on(table.completedAt),
  // Composite index for user's workout history queries
  userStartedIdx: index('workouts_user_started_idx').on(table.userId, table.startedAt),
}));

// ============================================================================
// TABLE 3: WORKOUT_EXERCISES (Junction Table)
// ============================================================================

export const workoutExercises = pgTable('workout_exercises', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),

  // Foreign Keys
  workoutId: integer('workout_id')
    .notNull()
    .references(() => workouts.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id')
    .notNull()
    .references(() => exercises.id, { onDelete: 'restrict' }),

  // Order within workout (1-indexed)
  orderIndex: integer('order_index').notNull().default(1),

  // Exercise-specific notes for this workout
  notes: text('notes'),

  // Target metrics (optional - what the user plans to achieve)
  targetSets: integer('target_sets'),
  targetReps: integer('target_reps'),
  targetWeight: real('target_weight'),
  targetWeightUnit: text('target_weight_unit').default('lbs'), // 'lbs' or 'kg'

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Indexes for performance
  workoutIdIdx: index('workout_exercises_workout_id_idx').on(table.workoutId),
  exerciseIdIdx: index('workout_exercises_exercise_id_idx').on(table.exerciseId),
  orderIdx: index('workout_exercises_order_idx').on(table.workoutId, table.orderIndex),
}));

// ============================================================================
// TABLE 4: SETS (Individual Set Performance Data)
// ============================================================================

export const sets = pgTable('sets', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),

  // Foreign Key
  workoutExerciseId: integer('workout_exercise_id')
    .notNull()
    .references(() => workoutExercises.id, { onDelete: 'cascade' }),

  // Set order (1-indexed)
  setNumber: integer('set_number').notNull().default(1),

  // Performance Metrics
  reps: integer('reps'), // Number of repetitions
  weight: real('weight'), // Weight used
  weightUnit: text('weight_unit').default('lbs'), // 'lbs' or 'kg'

  // RPE/RIR tracking
  rir: integer('rir'), // Reps in Reserve (0-10)
  rpe: real('rpe'), // Rate of Perceived Exertion (1-10, allows 0.5 increments)

  // Time-based metrics (for cardio, holds, etc.)
  duration: integer('duration'), // Seconds
  distance: real('distance'), // For cardio (miles, km, meters, etc.)
  distanceUnit: text('distance_unit'), // 'miles', 'km', 'meters', etc.

  // Additional metrics
  tempo: text('tempo'), // e.g., "3-0-1-0" (eccentric-pause-concentric-pause)
  restTime: integer('rest_time'), // Seconds before this set

  // Notes
  notes: text('notes'), // Per-set notes (e.g., "felt easy", "form breakdown")

  // Completion
  completed: integer('completed').notNull().default(1), // 0 = skipped, 1 = completed
  completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Indexes for performance
  workoutExerciseIdIdx: index('sets_workout_exercise_id_idx').on(table.workoutExerciseId),
  setNumberIdx: index('sets_set_number_idx').on(table.workoutExerciseId, table.setNumber),
  completedAtIdx: index('sets_completed_at_idx').on(table.completedAt),
}));

// ============================================================================
// RELATIONS (Drizzle ORM Relationship Definitions)
// ============================================================================

export const exercisesRelations = relations(exercises, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutsRelations = relations(workouts, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(workoutExercises, ({ one, many }) => ({
  workout: one(workouts, {
    fields: [workoutExercises.workoutId],
    references: [workouts.id],
  }),
  exercise: one(exercises, {
    fields: [workoutExercises.exerciseId],
    references: [exercises.id],
  }),
  sets: many(sets),
}));

export const setsRelations = relations(sets, ({ one }) => ({
  workoutExercise: one(workoutExercises, {
    fields: [sets.workoutExerciseId],
    references: [workoutExercises.id],
  }),
}));