---
name: RAPTOR Dashboard Implementation
overview: Implement a phased RAPTOR inspection dashboard with FileMaker backend, oRPC data contracts, and a modern shadcn-based UI featuring project list and detail views.
todos:
  - id: fm-data-model
    content: Define FileMaker tables and API layouts for RAPTOR data model
    status: completed
  - id: fm-client-update
    content: Update fm-client package with RAPTOR schemas and rename to @athens/fm-client
    status: completed
  - id: fm-client-exports
    content: Update fm-client exports to expose Zod schemas and Data API clients
    status: completed
  - id: orpc-procedures
    content: Implement oRPC routers for projects, projectAssets, smartList, issuesSummary
    status: completed
  - id: integration-tests
    content: Write integration tests for oRPC procedures against FileMaker
    status: completed
  - id: api-documentation
    content: Document oRPC routes in README
    status: completed
  - id: auth-pages
    content: Build login and signup pages with Better Auth
    status: completed
  - id: auth-middleware
    content: Add auth middleware for protected routes
    status: completed
  - id: auth-orpc
    content: Convert RAPTOR oRPC procedures to protectedProcedure
    status: completed
  - id: dashboard-layout
    content: Build collapsible sidebar layout and top navigation
    status: pending
  - id: dashboard-page
    content: Create dashboard home page with stats cards and project list/grid
    status: pending
  - id: project-detail-page
    content: Build project detail page with completion gauges and charts
    status: pending
---

# RAPTOR Dashboard Implementation Plan

## 1. FileMaker Data Model

Create the following tables/layouts in FileMaker for OData access:

### Core Tables

**Projects**

| Field | Type | Notes |

|-------|------|-------|

| id | UUID | Primary key |

| name | Text | Project name |

| region | Text | For filtering |

| phase | Text | Project phase |

| risk_level | Text | Low/Medium/High |

| overall_completion | Number | Percentage |

| readiness_score | Number | Calculated score |

| status | Text | R/Y/G indicator |

| created_at | Timestamp | |

| updated_at | Timestamp | |

**Assets**

| Field | Type | Notes |

|-------|------|-------|

| id | UUID | Primary key |

| name | Text | Rig/asset name |

| type | Text | Asset type |

| location | Text | |

**ProjectAssets** (join table - primary record for list/detail views)

| Field | Type | Notes |

|-------|------|-------|

| id | UUID | Primary key |

| project_id | UUID | FK to Projects |

| asset_id | UUID | FK to Assets |

| raptor_checklist_completion | Number | % |

| sit_completion | Number | System Integration Test % |

| doc_verification_completion | Number | % |

| checklist_remaining | Number | Count |

| checklist_closed | Number | Count |

| checklist_non_conforming | Number | Count |

| checklist_not_applicable | Number | Count |

| checklist_deferred | Number | Count |

**IssuesSummary** (aggregated daily - avoids querying large Issues table)

| Field | Type | Notes |

|-------|------|-------|

| id | UUID | Primary key |

| project_asset_id | UUID | FK to ProjectAssets |

| summary_date | Date | |

| total_items | Number | |

| open_high | Number | Action items by priority |

| closed_high | Number | |

| open_medium | Number | |

| closed_medium | Number | |

| open_low | Number | |

| closed_low | Number | |

| system_group | Text | SSH&E, Management Systems, etc. |

| system_progress | Number | % per system |

**SmartList** (action items)

| Field | Type | Notes |

|-------|------|-------|

| id | UUID | Primary key |

| project_asset_id | UUID | FK |

| title | Text | |

| description | Text | |

| priority | Text | High/Medium/Low |

| status | Text | Open/Closed/Deferred |

| due_date | Date | |

| milestone_target | Text | Prior To Sail, Prior To Contract, Develop Plan |

| system_group | Text | Category |

| assigned_to | Text | |

| created_at | Timestamp | |

| updated_at | Timestamp | |

---

## 2. fm-client Package Updates (COMPLETED)

Update [`packages/fm-client`](packages/fm-client) for RAPTOR schemas:

1. ✅ Rename package to `@athens/fm-client` in [`package.json`](packages/fm-client/package.json)
2. ✅ Update [`proofkit-typegen.config.jsonc`](packages/fm-client/proofkit-typegen.config.jsonc) with RAPTOR layouts
3. ✅ Generate new TypeScript types via `pnpm typegen`

Generated schemas in `src/schemas/filemaker/`:

- `generated/*.ts` - Auto-generated Zod schemas (DO NOT EDIT)
- `*.ts` - Customizable wrapper schemas
- `client/*.ts` - WebViewer clients (not used for OData)

---

## 3. fm-client Exports

Update `packages/fm-client/src/index.ts` to export:

- **Zod schemas** from `schemas/filemaker/*.ts`
- **Types** (TProjects, TAssets, etc.)
- **Data API clients** from `schemas/filemaker/client/*.ts` (uses @proofkit/fmdapi)
```typescript
// schemas/filemaker/index.ts
export * from './Projects';
export * from './Assets';
export * from './ProjectAssets';
export * from './SmartList';
export * from './IssuesSummary';

// Re-export clients
export * from './client';
```


The generated clients use `@proofkit/fmdapi` with WebViewerAdapter. For server-side usage, we may need to configure a different adapter or call Data API directly from oRPC procedures.

---

## 4. oRPC Procedures

Create oRPC routers in [`packages/api/src/routers`](packages/api/src/routers) that call the OData client:

### New Router Files

**`routers/projects.ts`** - Project list operations

- `projects.list` - Paginated list with filters (region, phase, risk_level, status)
- `projects.getById` - Single project details

**`routers/projectAssets.ts`** - Main record operations

- `projectAssets.list` - List with expanded project/asset data, sorting, filtering
- `projectAssets.getById` - Full detail including summaries
- `projectAssets.getSummaryStats` - Dashboard topline numbers

**`routers/smartList.ts`** - Action items

- `smartList.listByProjectAsset` - Filtered/sorted action items
- `smartList.getStatusSummary` - Counts by status/priority

**`routers/issuesSummary.ts`** - Aggregated checklist data

- `issuesSummary.getByProjectAsset` - Latest summary
- `issuesSummary.getSystemProgress` - Progress per system group

### Zod Schemas (contracts)

Re-export from fm-client generated schemas or create API-specific versions in [`packages/api/src/schemas`](packages/api/src/schemas):

- `project.schema.ts` - Input/output schemas for project procedures
- `asset.schema.ts` - Asset schemas
- `projectAsset.schema.ts` - ProjectAsset with expanded relations
- `smartList.schema.ts` - SmartList with filters
- `issuesSummary.schema.ts` - Summary aggregations

---

## 5. Integration Tests

Create tests in `packages/api/src/__tests__/`:

### Test Setup

**`vitest.config.ts`** - Configure Vitest for API package

**`__tests__/setup.ts`** - Load env vars, setup test context

### Test Files

**`__tests__/projects.test.ts`**

```typescript
describe('projects router', () => {
  it('should list all projects', async () => {})
  it('should filter by region', async () => {})
  it('should get project by id', async () => {})
})
```

**`__tests__/projectAssets.test.ts`**

**`__tests__/smartList.test.ts`**

**`__tests__/issuesSummary.test.ts`**

### Running Tests

```bash
pnpm --filter @athens/api test
```

---

## 6. Authentication (Better Auth)

Authentication is handled by [Better Auth](https://www.better-auth.com/) with FileMaker as the database backend via `@proofkit/better-auth`.

### Architecture

```
packages/auth/src/index.ts    → Server-side auth config (FileMakerAdapter)
apps/web/src/lib/auth-client.ts → Client-side auth hooks
apps/web/src/app/api/auth/[...all]/route.ts → Auth API routes
```

### Server Config (`@athens/auth`)

```typescript
import { betterAuth } from "better-auth";
import { FileMakerAdapter } from "@proofkit/better-auth";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: FileMakerAdapter({
    odata: {
      serverUrl: process.env.FM_SERVER,
      auth: { apiKey: process.env.OTTO_API_KEY },
      database: process.env.FM_DATABASE,
    },
  }),
  plugins: [nextCookies()],
});
```

### Client Usage (`authClient`)

```typescript
import { authClient } from "@/lib/auth-client";

// Sign up
await authClient.signUp.email({
  email: "user@example.com",
  password: "securepassword",
  name: "User Name",
});

// Sign in
await authClient.signIn.email({
  email: "user@example.com",
  password: "password",
});

// Sign out
await authClient.signOut();

// Get session (React hook)
const { data: session, isPending } = authClient.useSession();
```

### Auth Pages to Build

**`(auth)/login/page.tsx`** - Login page

- Email/password form using shadcn `Input`, `Button`, `Card`
- "Remember me" checkbox
- Link to signup
- Error handling with toast notifications
- Redirect to dashboard on success

**`(auth)/signup/page.tsx`** - Signup page

- Email, password, confirm password, name fields
- Form validation with Zod + TanStack Form
- Password strength indicator
- Link to login
- Redirect to dashboard on success

**`(auth)/logout/page.tsx`** (optional) - Logout confirmation

- Simple card with logout button
- Redirect to login after signout

### Auth Middleware

Create middleware to protect dashboard routes:

**`apps/web/src/middleware.ts`**

```typescript
import { auth } from "@athens/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export default async function middleware(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(dashboard)(.*)"],
};
```

### Session in Server Components

```typescript
import { auth } from "@athens/auth";
import { headers } from "next/headers";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return <div>Welcome, {session?.user.name}</div>;
}
```

### Protected oRPC Procedures

Use `protectedProcedure` for authenticated-only routes:

```typescript
import { protectedProcedure } from "../index";

export const privateRouter = {
  getMyData: protectedProcedure.handler(({ context }) => {
    // context.session.user available
    return { userId: context.session.user.id };
  }),
};
```

### Auth-Protected RAPTOR Procedures

Update existing routers to require authentication. Most RAPTOR data should be protected:

**`routers/projects.ts`** - Convert to protected procedures

```typescript
import { protectedProcedure } from "../index";
import { z } from "zod";

export const projectsRouter = {
  list: protectedProcedure
    .input(z.object({ /* filters */ }).optional())
    .handler(async ({ input, context }) => {
      // context.session.user available for audit logging
      const userId = context.session.user.id;
      // ... existing logic
    }),
    
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      // ... existing logic
    }),
};
```

**All RAPTOR routers to protect:**

| Router | Procedures | Auth Required |

|--------|------------|---------------|

| `projects` | `list`, `getById` | ✅ Protected |

| `assets` | `list`, `getById` | ✅ Protected |

| `projectAssets` | `list`, `getById`, `getSummaryStats` | ✅ Protected |

| `smartList` | `list`, `getById`, `getStatusSummary` | ✅ Protected |

| `issuesSummary` | `getByProjectAsset`, `getSystemProgress`, `getActionItemCounts` | ✅ Protected |

### User-Scoped Queries (Future)

For multi-tenant or role-based access, use session data to filter results:

```typescript
export const projectsRouter = {
  list: protectedProcedure.handler(async ({ context }) => {
    const { user } = context.session;
    
    // Filter by user's organization/permissions
    const filter = user.role === "admin" 
      ? undefined 
      : `assigned_to eq '${user.email}'`;
    
    return await ProjectsClient.client.find({ query: { filter } });
  }),
};
```

### Auth Router

Add user profile and session management procedures:

**`routers/auth.ts`**

```typescript
import { protectedProcedure, publicProcedure } from "../index";
import { z } from "zod";

export const authRouter = {
  // Get current user profile
  me: protectedProcedure.handler(({ context }) => {
    return {
      id: context.session.user.id,
      email: context.session.user.email,
      name: context.session.user.name,
    };
  }),

  // Check if user is authenticated (public - returns null if not)
  session: publicProcedure.handler(({ context }) => {
    return context.session ?? null;
  }),
};
```

---

## 7. App Routes (Updated)

### Route Structure

```
apps/web/src/app/
├── (auth)/
│   ├── login/page.tsx          # Existing - enhance styling
│   ├── signup/page.tsx         # New - card-centric signup
│   └── logout/page.tsx         # New - logout confirmation
├── (dashboard)/
│   ├── layout.tsx              # Collapsible sidebar layout
│   ├── page.tsx                # Dashboard home (project list)
│   └── projects/
│       └── [id]/
│           └── page.tsx        # Project detail view
└── layout.tsx                  # Root layout
```

---

## 8. UI Components

### Layout Components

- **`AppSidebar`** - Collapsible navigation (like screenshot 1)
- **`TopNav`** - Search, notifications, user menu
- **`DashboardLayout`** - Combines sidebar + main content area

### Dashboard Page Components

- **`StatsCards`** - Topline metrics row (Total Projects, Completion %, etc.)
- **`ProjectList`** - Sortable/filterable table view
- **`ProjectGrid`** - Card/tile view alternative
- **`ViewToggle`** - Switch between list/grid views
- **`ProjectFilters`** - Region, asset, phase, risk level dropdowns
- **`ProjectCard`** - Individual project tile with:
  - Name/ID
  - Readiness score badge
  - R/Y/G status indicator
  - Quick stats

### Project Detail Components

- **`CompletionGauges`** - Row of circular progress indicators:
  - RAPTOR Overall Completion
  - RAPTOR Checklist
  - System Integration Test
  - Document Verification
- **`ChecklistStatusChart`** - Bar chart (Remaining, Closed, Non-Conforming, N/A, Deferred)
- **`ActionItemStatusChart`** - Grouped bar chart by priority (High/Medium/Low × Open/Closed)
- **`ActionItemRequirementChart`** - By milestone target
- **`SystemProgressBars`** - Progress per system group (SSH&E, Management Systems, etc.)
- **`SmartListTable`** - Action items table with sorting/filtering
- **`ProjectHeader`** - Title, overall status, key metrics

### Shared Components

- **`StatusBadge`** - R/Y/G colored badges
- **`ProgressRing`** - Circular progress component
- **`DataTable`** - Reusable sortable/filterable table (shadcn)
- **`FilterDropdown`** - Multi-select filter component

---

## 9. Implementation Phases

### Phase 1A: Foundation (FileMaker + Types) ✅ COMPLETED

1. ✅ Create FileMaker tables via OData MCP (Projects, Assets, ProjectAssets, SmartList, IssuesSummary)
2. ✅ Add test data to FileMaker
3. ✅ Update fm-client package, rename to @athens/fm-client
4. ✅ Generate TypeScript types via ProofKit typegen

### Phase 1B: Data API + oRPC ✅ COMPLETED

1. ✅ Update fm-client exports (Zod schemas + Data API clients)
2. ✅ Create oRPC routers importing fm-client
3. ✅ Implement procedures: list, getById, filters, getSummaryStats, getStatusSummary
4. ✅ Write integration tests (16 tests passing)
5. ✅ Verify end-to-end: Frontend → oRPC → Data API → FileMaker

### Phase 1C: Authentication (NEXT)

1. Build login page with email/password form
2. Build signup page with validation
3. Add auth middleware for protected routes
4. Convert RAPTOR oRPC procedures to `protectedProcedure`
5. Add auth router (`me`, `session` procedures)
6. Test auth flow end-to-end

### Phase 1D: Dashboard UI

1. Build collapsible sidebar layout
2. Create dashboard page with stats cards
3. Implement project list/grid with view toggle
4. Add filtering and sorting
5. Connect to oRPC procedures

### Phase 1E: Project Details

1. Build detail page layout
2. Create completion gauge components
3. Build chart components (bar charts, progress bars)
4. Implement SmartList table with filtering

### Phase 1F: Polish

1. Enhance auth pages with modern card styling
2. Add loading states and skeletons
3. Responsive design refinements
4. Error handling and empty states