# Server Components

This document outlines the mandatory patterns for Server Components in this application. These rules are non-negotiable.

## Async Params and SearchParams

In Next.js 15+, `params` and `searchParams` are **Promises**. They MUST be awaited before use.

**ALL page and layout components that access `params` or `searchParams` MUST:**

1. Type them as `Promise<...>`
2. `await` them before accessing any properties

Do NOT:
```typescript
// BAD - params is not typed as Promise and not awaited
export default function Page({ params }: { params: { id: string } }) {
  const id = params.id;
}
```

Do:
```typescript
// GOOD - params is typed as Promise and awaited
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

### searchParams

The same rule applies to `searchParams`:

```typescript
// GOOD
interface PageProps {
  searchParams: Promise<{ date?: string; tz?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { date, tz } = await searchParams;
}
```

### Why?

In Next.js 15, `params` and `searchParams` were changed to be asynchronous. Accessing them synchronously will cause runtime errors. This is a breaking change from Next.js 14.
