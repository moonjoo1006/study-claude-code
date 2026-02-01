# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation First

**IMPORTANT:** Before generating any code, ALWAYS first read and refer to the relevant documentation files in the `/docs` directory. These docs contain project-specific patterns, API references, and implementation guidelines that must be followed. Do not rely on general knowledge—consult the docs to ensure code aligns with this project's conventions.

- /docs/ui.md

## Project Overview

Next.js 16.1.6 application using the App Router architecture with React 19, TypeScript, and Tailwind CSS v4. Uses Geist fonts for typography. Authentication is handled by Clerk.

## Development Commands

```bash
# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Architecture

### App Router Structure

Uses Next.js App Router (not Pages Router). All routes defined in `app/` directory:
- `app/layout.tsx` - Root layout with metadata and Geist font loading
- `app/page.tsx` - Home page component
- `app/globals.css` - Global styles with Tailwind v4 configuration

### Styling

Tailwind CSS v4 with PostCSS:
- Uses `@theme inline` syntax in `globals.css` for Tailwind v4
- CSS variables for colors (`--background`, `--foreground`) with automatic dark mode via media query
- Geist Sans and Geist Mono fonts loaded via `next/font/google`, exposed as CSS variables

### TypeScript

- Path alias: `@/*` maps to root directory
- Strict mode enabled
- JSX: `react-jsx` (React 19 JSX transform)
- Module resolution: `bundler`

### Authentication (Clerk)

Uses `@clerk/nextjs` for authentication:
- `middleware.ts` - Uses `clerkMiddleware()` from `@clerk/nextjs/server` to protect routes
- `app/layout.tsx` - Wrapped with `<ClerkProvider>`, includes `<SignInButton>`, `<SignUpButton>`, and `<UserButton>` in header
- Environment variables in `.env.local` (not tracked in git):
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
  - `CLERK_SECRET_KEY` - Clerk secret key
- Get API keys from: https://dashboard.clerk.com/last-active?path=api-keys

**Important:** Always use App Router patterns with Clerk. Never use deprecated `authMiddleware()` or Pages Router approach.
