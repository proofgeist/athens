# Athens

A modern full-stack TypeScript application built with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack).

## 🎯 Project Overview

Athens is a web application for the Athens client, designed as a **phased proof of concept**.

### Phase 1: RAPTOR Inspection Dashboard (Current)

The initial focus is building a dashboard for viewing project updates about **RAPTOR inspections**. This phase prioritizes:

- **Frontend Development** — Building a polished, responsive UI with modern React patterns
- **Simple Data Procedures** — Minimal backend complexity to iterate quickly on the UI
- **JSON-Based Data** — Using local JSON files as the data source

### Data Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Next.js   │ ──► │    oRPC     │ ──► │    Data     │
│  (Frontend) │     │ (Contracts) │     │  (JSON/DB)  │
└─────────────┘     └─────────────┘     └─────────────┘
```

The data flow is designed with **future flexibility** in mind:

1. **Now**: JSON files serve as the data source for rapid frontend development
2. **Later**: FileMaker database connection via a custom OData client

### oRPC Contract Strategy

We leverage oRPC's **contract-first approach** to predefine all inputs and outputs. This ensures:

- **Consistent JSON structure** regardless of the underlying data source
- **Type-safe interfaces** between frontend and backend
- **Seamless migration** from JSON files to FileMaker without frontend changes
- **Clear API documentation** via OpenAPI specs

The web application will always consume the same standardized JSON format, whether the data comes from static files or the FileMaker OData integration.

### Future Phases

- **Phase 2**: FileMaker database integration via OData client
- **Phase 3**: Extended inspection features and reporting
- **Phase 4**: Full production deployment

## 🚀 Tech Stack

### Frontend
- **[Next.js](https://nextjs.org/)** (App Router) - React framework with server-side rendering
- **[React 19](https://react.dev/)** - Latest React with React Compiler support
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality, accessible component library
- **[TanStack Query](https://tanstack.com/query)** - Powerful data synchronization for React
- **[TanStack Form](https://tanstack.com/form)** - Headless form library
- **[Next Themes](https://github.com/pacocoursey/next-themes)** - Dark mode support
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications

### Backend & API
- **[oRPC](https://orpc.dev/)** - End-to-end type-safe RPC framework
  - Type-safe APIs with automatic TypeScript inference
  - OpenAPI integration for API documentation
  - Zod validation built-in
  - TanStack Query integration for seamless client-side hooks
- **[Better Auth](https://www.better-auth.com/)** - Modern authentication library
  - Email/password authentication
  - Session management
  - Protected routes and API procedures

### Developer Experience
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety across the entire stack
- **[Biome](https://biomejs.dev/)** - Fast linter and formatter (replaces ESLint/Prettier)
- **[Turborepo](https://turbo.build/)** - High-performance monorepo build system
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager

### Additional Features
- **PWA Support** - Progressive Web App capabilities with manifest and service worker ready
- **React Compiler** - Automatic React optimizations via Babel plugin

## 📁 Project Structure

```
athens/
├── apps/
│   └── web/                    # Next.js frontend application
│       ├── src/
│       │   ├── app/            # Next.js App Router pages
│       │   │   ├── api/        # API routes
│       │   │   │   ├── auth/   # Better Auth API handler
│       │   │   │   └── rpc/    # oRPC API route handler
│       │   │   ├── dashboard/  # Protected dashboard page
│       │   │   ├── login/      # Login/signup page
│       │   │   └── page.tsx    # Home page
│       │   ├── components/     # React components
│       │   │   ├── ui/         # shadcn/ui components
│       │   │   ├── sign-in-form.tsx
│       │   │   ├── sign-up-form.tsx
│       │   │   └── user-menu.tsx
│       │   ├── lib/            # Utility functions (auth client)
│       │   └── utils/          # Client utilities (oRPC client setup)
│       └── public/             # Static assets
│
├── packages/
│   ├── api/                    # Shared API package
│   │   └── src/
│   │       ├── index.ts        # oRPC setup & procedures
│   │       ├── context.ts      # Request context creation
│   │       └── routers/        # API route definitions
│   │           └── index.ts    # Main app router
│   │
│   ├── auth/                   # Authentication package
│   │   └── src/
│   │       └── index.ts        # Better Auth configuration
│   │
│   └── config/                 # Shared TypeScript configuration
│       └── tsconfig.base.json  # Base TSConfig for all packages
│
├── biome.json                  # Biome linter/formatter config
├── turbo.json                  # Turborepo configuration
└── pnpm-workspace.yaml         # pnpm workspace configuration
```

## 🏗️ Architecture

### API Layer (`packages/api`)

The API package contains your business logic and type-safe procedures:

- **Procedures**: Define type-safe API endpoints using oRPC
- **Context**: Request context (includes auth session, database connections, etc.)
- **Routers**: Organize procedures into logical groups
- **Protected Procedures**: Use `protectedProcedure` for authenticated endpoints

Example procedures:
```typescript
export const appRouter = {
  // Public procedure
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  
  // Protected procedure (requires authentication)
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
};
```

### Frontend (`apps/web`)

The Next.js app consumes the API through the oRPC client:

- **API Route**: `/api/rpc/[[...rest]]/route.ts` handles all RPC requests
- **Auth Route**: `/api/auth/[...all]/route.ts` handles Better Auth requests
- **OpenAPI Docs**: Available at `/api/rpc/api-reference`
- **Client Setup**: `src/utils/orpc.ts` configures the oRPC client with TanStack Query
- **Usage**: Use `orpc.procedureName.queryOptions()` or `orpc.procedureName.useQuery()` in components
- **Pages**: Home (`/`), Login (`/login`), Dashboard (`/dashboard` - protected)

### Authentication (`packages/auth`)

Better Auth is configured for email/password authentication:

- **Configuration**: `packages/auth/src/index.ts` - Better Auth setup
- **Client**: `apps/web/src/lib/auth-client.ts` - Client-side auth utilities
- **Components**: Sign-in and sign-up forms, user menu with session management
- **Protected Routes**: Dashboard page and protected API procedures
- **Note**: Database connection needs to be configured for full functionality

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 9+

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start development server (runs on port 3001)
pnpm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Building

```bash
# Build all applications
pnpm run build
```

## 📜 Available Scripts

### Root Level
- `pnpm run dev` - Start all applications in development mode
- `pnpm run build` - Build all applications for production
- `pnpm run check-types` - Type-check all TypeScript code
- `pnpm run check` - Run Biome linting and formatting (with auto-fix)
- `pnpm run dev:web` - Start only the web app
- `pnpm run dev:native` - Start only native app (if configured)

### Web App (`apps/web`)
- `pnpm run dev` - Start Next.js dev server (port 3001)
- `pnpm run build` - Build Next.js app for production
- `pnpm run start` - Start production server
- `pnpm run generate-pwa-assets` - Generate PWA assets

## 🔧 Configuration

### TypeScript
- Base config: `packages/config/tsconfig.base.json`
- Strict mode enabled with comprehensive type checking
- Path aliases configured (`@/` for `src/`)

### Biome
- Linting and formatting configured
- Auto-fix on save recommended
- Tailwind CSS class sorting enabled

### Turborepo
- Caching enabled for faster builds
- Task dependencies configured
- Parallel execution where possible

## 📝 Adding New API Procedures

1. **Define the procedure** in `packages/api/src/routers/index.ts`:

```typescript
import { protectedProcedure, publicProcedure } from "../index";
import { z } from "zod";

export const appRouter = {
  // Public procedure
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  
  // Public procedure with input validation
  getUser: publicProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      // Your logic here
      return { id: input.id, name: "User" };
    }),
  
  // Protected procedure (requires authentication)
  getPrivateData: protectedProcedure.handler(({ context }) => {
    // context.session.user is available here
    return { userId: context.session.user.id };
  }),
};
```

2. **Use in components** via the oRPC client:

```typescript
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";

// Public procedure
const { data, isLoading } = orpc.getUser.useQuery({ id: "123" });

// Or using queryOptions
const { data } = useQuery(orpc.getUser.queryOptions({ id: "123" }));

// Protected procedure (requires user to be authenticated)
const { data: privateData } = orpc.getPrivateData.useQuery();
```

## 🔍 API Documentation

Once your dev server is running, visit:
- **OpenAPI Documentation**: http://localhost:3001/api/rpc/api-reference

## 📊 RAPTOR API Routes

The following oRPC procedures are available for the RAPTOR inspection dashboard:

### Projects (`orpc.projects.*`)

| Procedure | Input | Description |
|-----------|-------|-------------|
| `list` | `{ region?, phase?, risk_level?, status?, limit?, offset? }` | List projects with optional filters |
| `getById` | `{ id: string }` | Get single project by ID |

### Assets (`orpc.assets.*`)

| Procedure | Input | Description |
|-----------|-------|-------------|
| `list` | `{ type?, location?, limit?, offset? }` | List assets with optional filters |
| `getById` | `{ id: string }` | Get single asset by ID |

### Project Assets (`orpc.projectAssets.*`)

| Procedure | Input | Description |
|-----------|-------|-------------|
| `list` | `{ project_id?, asset_id?, limit?, offset? }` | List project-asset records |
| `getById` | `{ id: string }` | Get single project-asset by ID |
| `getSummaryStats` | none | Dashboard topline stats (avg completion %) |

### Smart List (`orpc.smartList.*`)

| Procedure | Input | Description |
|-----------|-------|-------------|
| `list` | `{ project_asset_id?, priority?, status?, system_group?, milestone_target?, limit?, offset? }` | List action items with filters |
| `getById` | `{ id: string }` | Get single action item by ID |
| `getStatusSummary` | `{ project_asset_id? }` | Counts by status and priority |

### Issues Summary (`orpc.issuesSummary.*`)

| Procedure | Input | Description |
|-----------|-------|-------------|
| `getByProjectAsset` | `{ project_asset_id: string }` | Latest summary for project asset |
| `getSystemProgress` | `{ project_asset_id: string }` | Progress % per system group |
| `getActionItemCounts` | `{ project_asset_id: string }` | Aggregated counts by priority |

### Usage Example

```typescript
import { orpc } from "@/utils/orpc";

// List all projects
const { data: projects } = orpc.projects.list.useQuery({ limit: 50 });

// Filter by region
const { data: northSeaProjects } = orpc.projects.list.useQuery({ 
  region: "North Sea" 
});

// Get dashboard stats
const { data: stats } = orpc.projectAssets.getSummaryStats.useQuery();

// Get action items for a project
const { data: actionItems } = orpc.smartList.list.useQuery({ 
  project_asset_id: "1",
  priority: "High",
  status: "Open"
});
```

### Running API Tests

```bash
pnpm test:api
```

Tests verify FileMaker Data API connectivity and all CRUD operations.

## 🎨 UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) components. To add new components:

```bash
cd apps/web
pnpm dlx shadcn@latest add [component-name]
```

Components are located in `apps/web/src/components/ui/`.

## 📦 Package Management

This is a pnpm workspace monorepo. Packages reference each other using workspace protocol:

- `@athens/api` - The API package (oRPC procedures)
- `@athens/auth` - Authentication package (Better Auth configuration)
- `@athens/config` - Shared TypeScript config

## 🚢 Deployment

Currently configured for:
- **Frontend**: Self-hosted (Next.js)
- **Backend**: Self-hosted (Next.js API routes)
- **Database**: None configured (required for authentication)
- **Auth**: Better Auth configured with email/password (database connection needed)

## 🔐 Authentication

The app includes Better Auth for authentication:

- **Sign In/Sign Up**: Forms available at `/login`
- **Protected Routes**: Dashboard page requires authentication
- **Session Management**: User menu component shows current session
- **API Protection**: Use `protectedProcedure` for authenticated endpoints

To enable full authentication functionality, configure a database connection in `packages/auth/src/index.ts`.

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [oRPC Documentation](https://orpc.dev/)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Biome Documentation](https://biomejs.dev/)

## 📄 License

[Add your license here]
