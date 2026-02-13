# Authentication Coding Standards

This application uses **Clerk** (`@clerk/nextjs`) as its exclusive authentication provider.

## Rules

1. **ONLY use Clerk for authentication** - Do not introduce any other auth libraries or custom auth solutions
2. **Never use deprecated APIs** - Use `clerkMiddleware()` from `@clerk/nextjs/server`, never the deprecated `authMiddleware()`
3. **Always use App Router patterns** - Never use Pages Router auth approaches

## Architecture

### Middleware

Route protection is handled by `clerkMiddleware()` in `middleware.ts` at the project root. This runs on every matching request and makes auth state available to the application.

```typescript
// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();
```

### ClerkProvider

The root layout (`app/layout.tsx`) wraps the entire app in `<ClerkProvider>`. This is required and must remain at the top level.

### UI Components

Use Clerk's built-in React components for all auth UI:

- `<SignInButton>` / `<SignUpButton>` - Auth triggers (use `mode="modal"` for modal-based flows)
- `<SignedIn>` / `<SignedOut>` - Conditional rendering based on auth state
- `<UserButton>` - User avatar with account management dropdown

Do NOT build custom sign-in/sign-up forms. Use Clerk's hosted or embedded components.

### Server-Side Auth

Use the `auth()` function from `@clerk/nextjs/server` to get the current user in Server Components and data helpers:

```typescript
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
if (!userId) {
  throw new Error("Unauthorized");
}
```

This is the **only** way to authenticate users on the server. Every data-access function must call `auth()` and validate the `userId` before querying data. See `/docs/data-fetching.md` for the full data isolation requirements.

### User Identity

Clerk user IDs (strings like `user_2x...`) are used as the foreign key to associate data with users. In the database schema, user-owned tables store this as a `text` column named `userId` (e.g., `workouts.userId`).

Do NOT store additional user profile data locally unless there is a specific requirement. Rely on Clerk for user management.

## Environment Variables

Required in `.env.local` (never committed to git):

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key

Get API keys from: https://dashboard.clerk.com/last-active?path=api-keys

## Protecting Routes

To make specific routes public or add custom logic, use `clerkMiddleware()` with a callback:

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/about"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});
```

Do NOT implement custom redirect logic or session checks outside of the middleware.