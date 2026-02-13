# Data Mutations

This document outlines the mandatory patterns for all data mutations (create, update, delete) in this application. These rules are non-negotiable.

## Server Actions Only

**ALL data mutations MUST be performed via Server Actions.**

Do NOT mutate data using:
- Route Handlers (`app/api/**/route.ts`)
- Client-side fetch calls
- `useEffect` hooks
- Any other mechanism

## Colocated `actions.ts` Files

**ALL server actions MUST live in colocated `actions.ts` files** within the relevant route directory.

Every `actions.ts` file must start with the `"use server"` directive.

```
app/
  workouts/
    page.tsx        # Server Component (data fetching)
    actions.ts      # Server Actions (data mutations)
    components/     # Client Components that call the actions
```

Do NOT:
- Define server actions inline within components
- Place server actions in a shared/global actions file
- Place server actions in the `/data` directory

## Data Helpers in `/data` Directory

**ALL database operations MUST go through helper functions in the `/data` directory.** Server actions call these helpers — they do not query the database directly.

Use Drizzle ORM exclusively. Raw SQL is NOT permitted.

```typescript
// data/workouts.ts
import { db } from '@/src';
import { workouts } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function createWorkout(data: { name: string; startedAt: Date }) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const [workout] = await db
    .insert(workouts)
    .values({
      userId,
      name: data.name,
      startedAt: data.startedAt,
    })
    .returning();

  return workout;
}

export async function deleteWorkout(workoutId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await db
    .delete(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId) // Critical: prevents deleting other users' data
      )
    );
}
```

## Typed Parameters (No FormData)

**Server action parameters MUST be typed. The `FormData` type is NOT permitted.**

Do NOT:
```typescript
// BAD - uses FormData
export async function createWorkout(formData: FormData) {
  const name = formData.get("name") as string;
}
```

Do:
```typescript
// GOOD - typed parameters
export async function createWorkout(name: string, startedAt: Date) {
  // ...
}
```

## Zod Validation Required

**ALL server actions MUST validate their arguments using Zod.** Server actions are public HTTP endpoints — never trust incoming data.

Define Zod schemas alongside the action and parse arguments before any other logic.

### Full Example

```typescript
// app/workouts/actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createWorkout, deleteWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(200),
  startedAt: z.coerce.date(),
});

export async function createWorkoutAction(params: { name: string; startedAt: Date }) {
  const validated = createWorkoutSchema.parse(params);
  const workout = await createWorkout(validated);
  revalidatePath("/workouts");
  return workout;
}

const deleteWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
});

export async function deleteWorkoutAction(params: { workoutId: number }) {
  const validated = deleteWorkoutSchema.parse(params);
  await deleteWorkout(validated.workoutId);
  revalidatePath("/workouts");
}
```

### Calling from Client Components

```tsx
// app/workouts/components/new-workout-form.tsx
"use client";

import { createWorkoutAction } from "../actions";

export function NewWorkoutForm() {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Extract typed values from form state, then call the action
    await createWorkoutAction({ name, startedAt: new Date() });
  }

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

## No Redirects in Server Actions

**Do NOT call `redirect()` inside server actions.** Server actions must return control to the client. Perform redirects client-side after the server action resolves.

Do NOT:
```typescript
// BAD - redirect inside server action
"use server";
import { redirect } from "next/navigation";

export async function createWorkoutAction(params: { name: string }) {
  const validated = createWorkoutSchema.parse(params);
  await createWorkout(validated);
  revalidatePath("/workouts");
  redirect("/workouts"); // Never do this
}
```

Do:
```typescript
// GOOD - server action returns, client redirects
"use server";

export async function createWorkoutAction(params: { name: string }) {
  const validated = createWorkoutSchema.parse(params);
  await createWorkout(validated);
  revalidatePath("/workouts");
}
```

```tsx
// GOOD - client component handles the redirect
"use client";
import { useRouter } from "next/navigation";

export function NewWorkoutForm() {
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await createWorkoutAction({ name });
    router.push("/workouts"); // Redirect on the client
  }

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

## User Data Isolation

Every data helper function that performs a mutation MUST:

1. Authenticate the user via Clerk's `auth()`
2. Scope ALL mutations to the authenticated `userId`
3. Throw an error if no user is authenticated

For updates and deletes, ALWAYS include `userId` in the WHERE clause to prevent users from modifying other users' data. See `/docs/data-fetching.md` for the full data isolation requirements.

## Security Checklist

Before merging any code that mutates data:

- [ ] Mutation is triggered via a Server Action in a colocated `actions.ts` file
- [ ] `actions.ts` starts with `"use server"`
- [ ] Server action parameters are typed (no `FormData`)
- [ ] Arguments are validated with Zod before any logic runs
- [ ] Database operation goes through a `/data` helper function
- [ ] Drizzle ORM is used (no raw SQL)
- [ ] `auth()` is called and `userId` is validated in the data helper
- [ ] ALL mutations are scoped to the authenticated `userId`
- [ ] `revalidatePath` or `revalidateTag` is called to refresh stale data