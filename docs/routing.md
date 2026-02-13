# Routing Coding Standards

This application uses the **Next.js App Router** with all user-facing routes nested under `/dashboard`.

## Rules

1. **All routes live under `/dashboard`** - Every page in the app (except the public landing page at `/`) must be a child of `app/dashboard/`. Do not create top-level routes outside of `app/dashboard/`.
2. **Route protection is handled by middleware only** - The `middleware.ts` file at the project root uses `clerkMiddleware()` with `createRouteMatcher` to protect all non-public routes. Do NOT add auth guards or redirect logic inside page components or layouts.
3. **Only `/` is public** - The `isPublicRoute` matcher in `middleware.ts` defines public routes. All other routes (including everything under `/dashboard`) require authentication automatically.

## Route Structure

```
app/
├── page.tsx                                    # / (public landing page)
└── dashboard/
    ├── page.tsx                                # /dashboard (main dashboard)
    └── workout/
        ├── new/
        │   └── page.tsx                        # /dashboard/workout/new
        └── [workoutId]/
            └── page.tsx                        # /dashboard/workout/:workoutId
```

## Adding New Routes

When adding a new route:

1. Create it inside `app/dashboard/` — never as a top-level route.
2. No additional auth logic is needed. The middleware automatically protects it.
3. If a route must be public (rare), add its pattern to the `isPublicRoute` matcher in `middleware.ts`.

## Middleware Configuration

Route protection is centralized in `middleware.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});
```

Do NOT modify the middleware matcher config unless you understand the implications. The matcher already excludes Next.js internals and static files.