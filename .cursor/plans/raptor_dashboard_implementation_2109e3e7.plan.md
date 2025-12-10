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

## 6. App Routes

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

## 7. UI Components

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

## 8. Implementation Phases

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

### Phase 1C: Dashboard UI (NEXT)

1. Build collapsible sidebar layout
2. Create dashboard page with stats cards
3. Implement project list/grid with view toggle
4. Add filtering and sorting
5. Connect to oRPC procedures

### Phase 1D: Project Details

1. Build detail page layout
2. Create completion gauge components
3. Build chart components (bar charts, progress bars)
4. Implement SmartList table with filtering

### Phase 1E: Polish

1. Enhance auth pages with modern card styling
2. Add loading states and skeletons
3. Responsive design refinements
4. Error handling and empty states