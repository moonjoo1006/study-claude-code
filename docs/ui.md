# UI Coding Standards

## Component Library

This project uses **shadcn/ui** as the exclusive component library.

### Rules

1. **ONLY use shadcn/ui components** - All UI elements must be built using shadcn/ui components
2. **NO custom components** - Do not create custom UI components; use shadcn/ui primitives and compose them as needed
3. **No alternative UI libraries** - Do not introduce other component libraries (e.g., Material UI, Chakra, Ant Design)

### Adding Components

Install shadcn/ui components as needed via:

```bash
npx shadcn@latest add <component-name>
```

Reference: https://ui.shadcn.com/docs/components

---

## Date Formatting

Use **date-fns** for all date formatting operations.

### Installation

```bash
npm install date-fns
```

### Standard Date Format

Dates should be formatted with ordinal day suffixes:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

### Implementation

```typescript
import { format } from "date-fns";

function formatDate(date: Date): string {
  return format(date, "do MMM yyyy");
}

// Examples:
// formatDate(new Date(2025, 8, 1))  → "1st Sep 2025"
// formatDate(new Date(2025, 7, 2))  → "2nd Aug 2025"
// formatDate(new Date(2026, 0, 3))  → "3rd Jan 2026"
// formatDate(new Date(2024, 5, 4))  → "4th Jun 2024"
```

### Format Token Reference

- `do` - Day of month with ordinal (1st, 2nd, 3rd, 4th, etc.)
- `MMM` - Abbreviated month name (Jan, Feb, Mar, etc.)
- `yyyy` - 4-digit year
