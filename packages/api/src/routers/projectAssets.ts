import { z } from "zod";
import { eq, and } from "@proofkit/fmodata";
import { protectedProcedure } from "../index";
import { db, ProjectAssets, Projects, Assets } from "../db";
import { ProjectAssetSortBySchema, SortOrderSchema } from "../shared/project-assets";
import { ProjectStatusSchema } from "../schemas/Projects";

// Input schemas
const listProjectAssetsInput = z.object({
  project_id: z.string().optional(),
  asset_id: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

const listDetailedInput = z.object({
  search: z.string().optional(),
  status: ProjectStatusSchema.optional(),
  assetType: z.string().optional(),
  sortBy: ProjectAssetSortBySchema.optional(),
  sortOrder: SortOrderSchema.default("asc"),
  limit: z.number().min(1).max(10000).default(50), // Increased max for client-side filtering
  offset: z.number().min(0).default(0),
});

const getProjectAssetByIdInput = z.object({
  id: z.string(),
});

// Output schemas
export const projectAssetDetailedItemSchema = z.object({
  id: z.string().nullable(),
  project_id: z.string().nullable(),
  asset_id: z.string().nullable(),
  // Completion percentages
  overall_completion: z.number().nullable(),
  checklist_percent: z.number().nullable(),
  sit_percent: z.number().nullable(),
  doc_percent: z.number().nullable(),
  // Checklist counts
  checklist_total: z.number().nullable(),
  checklist_remaining: z.number().nullable(),
  checklist_closed: z.number().nullable(),
  checklist_non_conforming: z.number().nullable(),
  checklist_not_applicable: z.number().nullable(),
  checklist_deferred: z.number().nullable(),
  // SIT counts
  sit_total: z.number().nullable(),
  sit_remaining: z.number().nullable(),
  sit_closed: z.number().nullable(),
  // Doc counts
  doc_total: z.number().nullable(),
  doc_remaining: z.number().nullable(),
  doc_closed: z.number().nullable(),
  // Enriched fields from related data
  projectName: z.string().nullable().optional(),
  projectRegion: z.string().nullable().optional(),
  projectStatus: ProjectStatusSchema.nullable().optional(),
  projectStartDate: z.string().nullable().optional(),
  projectEndDate: z.string().nullable().optional(),
  assetName: z.string().nullable().optional(),
  assetType: z.string().nullable().optional(),
  assetLocation: z.string().nullable().optional(),
});

const listDetailedOutput = z.object({
  data: z.array(projectAssetDetailedItemSchema),
  total: z.number(),
});

// ProjectAssets router (protected - requires authentication)
export const projectAssetsRouter = {
  list: protectedProcedure
    .input(listProjectAssetsInput)
    .handler(async ({ input }) => {
      const { project_id, asset_id, limit, offset } = input;

      const filters = [];
      if (project_id) filters.push(eq(ProjectAssets.project_id, project_id));
      if (asset_id) filters.push(eq(ProjectAssets.asset_id, asset_id));

      let query = db.from(ProjectAssets).list().top(limit).skip(offset).expand(Projects).expand(Assets);
      
      if (filters.length > 0) {
        query = query.where(filters.length === 1 ? filters[0]! : and(...filters));
      }

      const result = await query.execute();

      if (result.error) {
        return { data: [], total: 0 };
      }

      return {
        data: result.data ?? [],
        total: result.data?.length ?? 0,
      };
    }),

  getById: protectedProcedure
    .input(getProjectAssetByIdInput)
    .handler(async ({ input }) => {
      const result = await db
        .from(ProjectAssets)
        .list()
        .where(eq(ProjectAssets.id, input.id))
        .single()
        .execute();

      if (result.error || !result.data) {
        throw new Error(`ProjectAsset not found: ${input.id}`);
      }

      return result.data;
    }),

  getDetailById: protectedProcedure
    .input(getProjectAssetByIdInput)
    .output(projectAssetDetailedItemSchema)
    .handler(async ({ input }) => {
      const result = await db
        .from(ProjectAssets)
        .list()
        .where(eq(ProjectAssets.id, input.id))
        .expand(Projects, (p) =>
          p.select({
            name: Projects.name,
            region: Projects.region,
            status: Projects.status,
            start_date: Projects.start_date,
            end_date: Projects.end_date,
          })
        )
        .expand(Assets, (a) =>
          a.select({
            name: Assets.name,
            type: Assets.type,
            location: Assets.location,
          })
        )
        .single()
        .execute();

      if (result.error || !result.data) {
        throw new Error(`ProjectAsset not found: ${input.id}`);
      }

      const item = result.data;
      const projectArray = item.Projects;
      const assetArray = item.Assets;

      let projectName: string | null = null;
      let projectRegion: string | null = null;
      let projectStatus: string | null = null;
      let projectStartDate: string | null = null;
      let projectEndDate: string | null = null;
      let assetName: string | null = null;
      let assetType: string | null = null;
      let assetLocation: string | null = null;

      if (Array.isArray(projectArray) && projectArray.length > 0) {
        const project = projectArray[0];
        projectName = project?.name ?? null;
        projectRegion = project?.region ?? null;
        projectStatus = project?.status ?? null;
        projectStartDate = project?.start_date ?? null;
        projectEndDate = project?.end_date ?? null;
      }

      if (Array.isArray(assetArray) && assetArray.length > 0) {
        const asset = assetArray[0];
        assetName = asset?.name ?? null;
        assetType = asset?.type ?? null;
        assetLocation = asset?.location ?? null;
      }

      // Extract only the ProjectAssets fields, excluding expanded arrays
      const { Projects: _, Assets: __, ...projectAssetItem } = item;

      return projectAssetDetailedItemSchema.parse({
        ...projectAssetItem,
        projectName,
        projectRegion,
        projectStatus,
        projectStartDate,
        projectEndDate,
        assetName,
        assetType,
        assetLocation,
      });
    }),

  // Get summary stats for dashboard
  getSummaryStats: protectedProcedure.handler(async () => {
    const result = await db.from(ProjectAssets).list().top(1000).execute();

    if (result.error || !result.data) {
      return {
        totalProjects: 0,
        avgRaptorCompletion: 0,
        avgSitCompletion: 0,
        avgDocVerification: 0,
      };
    }

    const data = result.data;
    const total = data.length;

    // Calculate averages
    let sumRaptor = 0;
    let sumSit = 0;
    let sumDoc = 0;

    for (const pa of data) {
      sumRaptor += pa.checklist_percent ?? 0;
      sumSit += pa.sit_percent ?? 0;
      sumDoc += pa.doc_percent ?? 0;
    }

    const avgCompletion = sumRaptor / (total || 1);
    const avgSitCompletion = sumSit / (total || 1);
    const avgDocVerification = sumDoc / (total || 1);

    return {
      totalProjects: total,
      avgRaptorCompletion: Math.round(avgCompletion),
      avgSitCompletion: Math.round(avgSitCompletion),
      avgDocVerification: Math.round(avgDocVerification),
    };
  }),

  // List project assets for dashboard overview
  listForDashboard: protectedProcedure.handler(async () => {
    const result = await db
      .from(ProjectAssets)
      .list()
      .top(5)
      .expand(Projects, (p) => p.select({ name: Projects.name }))
      .expand(Assets, (a) => a.select({ name: Assets.name }))
      .execute();

    if (result.error || !result.data) {
      return { data: [] };
    }

    // Map to include projectName and assetName from expanded data
    const enrichedData = result.data.map((item) => {
      const projectName = Array.isArray(item?.Projects) && item?.Projects.length > 0
        ? item?.Projects[0]!.name
        : null;
      const assetName = Array.isArray(item?.Assets) && item?.Assets.length > 0
        ? item?.Assets[0]!.name
        : null;

      return {
        id: item.id,
        project_id: item.project_id,
        asset_id: item.asset_id,
        projectName,
        assetName,
        checklist_percent: item.checklist_percent ?? 0,
        sit_percent: item.sit_percent ?? 0,
        doc_percent: item.doc_percent ?? 0,
      };
    });

    return { data: enrichedData };
  }),

  // List project assets with detailed filtering, sorting, and pagination
  listDetailed: protectedProcedure
    .input(listDetailedInput)
    .output(listDetailedOutput)
    .handler(async ({ input }) => {
      const { limit, offset } = input;

      // Fetch data with expanded Projects and Assets
      const result = await db
        .from(ProjectAssets)
        .list()
        .top(1000) // Fetch more for client-side filtering/sorting
        .expand(Projects, (p) =>
          p.select({
            name: Projects.name,
            region: Projects.region,
            status: Projects.status,
            start_date: Projects.start_date,
            end_date: Projects.end_date,
          })
        )
        .expand(Assets, (a) =>
          a.select({
            name: Assets.name,
            type: Assets.type,
            location: Assets.location,
          })
        )
        .execute();

      if (result.error || !result.data) {
        return listDetailedOutput.parse({ data: [], total: 0 });
      }

      // Enrich and flatten the data
      let enrichedData = result.data.map((item) => {
        const projectArray = item.Projects;
        const assetArray = item.Assets;

        let projectName: string | null = null;
        let projectRegion: string | null = null;
        let projectStatus: string | null = null;
        let projectStartDate: string | null = null;
        let projectEndDate: string | null = null;
        let assetName: string | null = null;
        let assetType: string | null = null;
        let assetLocation: string | null = null;

        if (Array.isArray(projectArray) && projectArray.length > 0) {
          const project = projectArray[0];
          projectName = project?.name ?? null;
          projectRegion = project?.region ?? null;
          projectStatus = project?.status ?? null;
          projectStartDate = project?.start_date ?? null;
          projectEndDate = project?.end_date ?? null;
        }

        if (Array.isArray(assetArray) && assetArray.length > 0) {
          const asset = assetArray[0];
          assetName = asset?.name ?? null;
          assetType = asset?.type ?? null;
          assetLocation = asset?.location ?? null;
        }

        // Extract only the ProjectAssets fields, excluding expanded arrays
        const { Projects: _, Assets: __, ...projectAssetItem } = item;

        return {
          ...projectAssetItem,
          projectName,
          projectRegion,
          projectStatus,
          projectStartDate,
          projectEndDate,
          assetName,
          assetType,
          assetLocation,
        };
      });

      // Apply filters
      if (input.search) {
        const searchLower = input.search.toLowerCase();
        enrichedData = enrichedData.filter(
          (item) =>
            item.projectName?.toLowerCase().includes(searchLower) ||
            item.assetName?.toLowerCase().includes(searchLower)
        );
      }

      if (input.status) {
        enrichedData = enrichedData.filter(
          (item) => item.projectStatus === input.status
        );
      }

      if (input.assetType) {
        enrichedData = enrichedData.filter(
          (item) => item.assetType === input.assetType
        );
      }

      // Apply sorting
      if (input.sortBy) {
        enrichedData.sort((a, b) => {
          let aVal: any;
          let bVal: any;

          switch (input.sortBy) {
            case "projectName":
              aVal = a.projectName?.toLowerCase() ?? "";
              bVal = b.projectName?.toLowerCase() ?? "";
              break;
            case "assetName":
              aVal = a.assetName?.toLowerCase() ?? "";
              bVal = b.assetName?.toLowerCase() ?? "";
              break;
            case "raptor":
              aVal = a.checklist_percent ?? 0;
              bVal = b.checklist_percent ?? 0;
              break;
            case "sit":
              aVal = a.sit_percent ?? 0;
              bVal = b.sit_percent ?? 0;
              break;
            case "doc":
              aVal = a.doc_percent ?? 0;
              bVal = b.doc_percent ?? 0;
              break;
            case "remaining":
              aVal = a.checklist_remaining ?? 0;
              bVal = b.checklist_remaining ?? 0;
              break;
            default:
              aVal = 0;
              bVal = 0;
          }

          if (aVal < bVal) return input.sortOrder === "asc" ? -1 : 1;
          if (aVal > bVal) return input.sortOrder === "asc" ? 1 : -1;
          return 0;
        });
      }

      // Apply pagination
      const total = enrichedData.length;
      const paginatedData = enrichedData.slice(offset, offset + limit);

      const output = {
        data: paginatedData,
        total,
      };

      return listDetailedOutput.parse(output);
    }),
};
