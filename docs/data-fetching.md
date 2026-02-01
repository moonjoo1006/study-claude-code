# Data Fetching

This document outlines the mandatory data fetching patterns for this application. These rules are non-negotiable and must be followed for all data operations.

## Server Components Only

**ALL data fetching in this application MUST be done via Server Components.**

Do NOT fetch data using:
- Route Handlers (`app/api/**/route.ts`)
- Client Components (`'use client'` components)
- `useEffect` hooks
- Third-party data fetching libraries on the client (SWR, React Query, etc.)
- Any other client-side data fetching mechanism

### Why Server Components?

- Data fetching happens at build time or request time on the server
- No client-side waterfalls
- Direct database access without exposing credentials
- Automatic request deduplication
- Better security - sensitive operations never reach the client

### Example Pattern

```tsx
// app/workouts/page.tsx (Server Component - no 'use client' directive)
import { getWorkouts } from '@/data/workouts';

export default async function WorkoutsPage() {
  const workouts = await getWorkouts();

  return (
    <div>
      {workouts.map(workout => (
        <WorkoutCard key={workout.id} workout={workout} />
      ))}
    </div>
  );
}
```

## Database Queries via `/data` Directory

**ALL database queries MUST be performed through helper functions in the `/data` directory.**

Do NOT:
- Write database queries directly in components
- Write database queries in route handlers
- Write raw SQL queries anywhere

Do:
- Create and use helper functions in `/data/*.ts`
- Use Drizzle ORM for all database operations

### Drizzle ORM Required

**Use Drizzle ORM exclusively. Raw SQL is NOT permitted.**

```tsx
// data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function getWorkouts() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}
```

## User Data Isolation (Critical Security Requirement)

**A logged-in user can ONLY access their own data. This is a critical security requirement.**

Every data helper function MUST:

1. Authenticate the user via Clerk's `auth()`
2. Filter ALL queries by the authenticated `userId`
3. Throw an error if no user is authenticated

### Mandatory Pattern

```tsx
// data/example.ts
import { db } from '@/db';
import { someTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function getUserData() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // ALWAYS filter by userId - users can only see their own data
  return db
    .select()
    .from(someTable)
    .where(eq(someTable.userId, userId));
}

export async function getDataById(id: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // ALWAYS include userId in the WHERE clause
  const result = await db
    .select()
    .from(someTable)
    .where(
      and(
        eq(someTable.id, id),
        eq(someTable.userId, userId)  // Critical: prevents accessing other users' data
      )
    );

  return result[0];
}
```

### Security Checklist

Before merging any code that touches data:

- [ ] Data is fetched in a Server Component (no `'use client'`)
- [ ] Database query is in a `/data` helper function
- [ ] Drizzle ORM is used (no raw SQL)
- [ ] `auth()` is called and `userId` is validated
- [ ] ALL queries filter by `userId` to ensure data isolation
- [ ] No route handlers are used for data fetching
