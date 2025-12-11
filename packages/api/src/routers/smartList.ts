import { z } from "zod";
import { eq, and } from "@proofkit/fmodata";
import { protectedProcedure } from "../index";
import { db, SmartList, ProjectAssets, Projects, Assets } from "../db";

// Input schemas
const listSmartListInput = z.object({
  project_asset_id: z.string().optional(),
  priority: z.enum(["High", "Medium", "Low"]).optional(),
  status: z.enum(["Open", "Closed", "Deferred"]).optional(),
  system_group: z.string().optional(),
  milestone_target: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  includeRelated: z.boolean().default(false),
});

const getSmartListByIdInput = z.object({
  id: z.string(),
});

const getStatusSummaryInput = z.object({
  project_asset_id: z.string().optional(),
});

// Output schemas - define the shape returned by procedures
const smartListItemSchema = z.object({
  id: z.string().nullable(),
  project_asset_id: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  priority: z.string().nullable(),
  status: z.string().nullable(),
  due_date: z.string().nullable(),
  milestone_target: z.string().nullable(),
  system_group: z.string().nullable(),
  assigned_to: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
  // Enriched fields from related data (optional - only present when includeRelated=true)
  projectName: z.string().nullable().optional(),
  projectRegion: z.string().nullable().optional(),
  assetName: z.string().nullable().optional(),
  assetType: z.string().nullable().optional(),
});

const listSmartListOutput = z.object({
  data: z.array(smartListItemSchema),
  total: z.number(),
});

// SmartList router (protected - requires authentication)
export const smartListRouter = {
  list: protectedProcedure
    .input(listSmartListInput)
    .output(listSmartListOutput)
    .handler(async ({ input }) => {
      const { project_asset_id, priority, status, system_group, milestone_target, limit, offset, includeRelated } = input;

      const filters = [];
      if (project_asset_id) filters.push(eq(SmartList.project_asset_id, project_asset_id));
      if (priority) filters.push(eq(SmartList.priority, priority));
      if (status) filters.push(eq(SmartList.status, status));
      if (system_group) filters.push(eq(SmartList.system_group, system_group));
      if (milestone_target) filters.push(eq(SmartList.milestone_target, milestone_target));

      // Build base query
      let baseQuery = db.from(SmartList).list().top(limit).skip(offset);
      
      if (filters.length > 0) {
        baseQuery = baseQuery.where(filters.length === 1 ? filters[0]! : and(...filters));
      }

      // Execute with or without related data
      if (includeRelated) {
        // Step 1: Get SmartList items
        const smartListResult = await baseQuery.execute();

        if (smartListResult.error || !smartListResult.data) {
          return { data: [], total: 0 };
        }

        // Step 2: Collect unique project_asset_ids
        const projectAssetIds = new Set<string>();
        for (const item of smartListResult.data) {
          if (item.project_asset_id) {
            projectAssetIds.add(item.project_asset_id);
          }
        }

        // Step 3: Fetch ProjectAssets with expanded Projects and Assets
        // (This works because we query FROM ProjectAssets with direct relationships)
        const projectAssetMap = new Map<string, { 
          projectName: string | null; 
          projectRegion: string | null; 
          assetName: string | null; 
          assetType: string | null; 
        }>();

        // Fetch in parallel
        const paPromises = [...projectAssetIds].map(async (paId) => {
          const result = await db
            .from(ProjectAssets)
            .list()
            .where(eq(ProjectAssets.id, paId))
            .expand(Projects, p => p.select({ name: Projects.name, region: Projects.region }))
            .expand(Assets, a => a.select({ name: Assets.name, type: Assets.type }))
            .single()
            .execute();

          if (result.data) {
            const projectsArr = (result.data as any).Projects;
            const assetsArr = (result.data as any).Assets;
            projectAssetMap.set(paId, {
              projectName: Array.isArray(projectsArr) && projectsArr[0]?.name || null,
              projectRegion: Array.isArray(projectsArr) && projectsArr[0]?.region || null,
              assetName: Array.isArray(assetsArr) && assetsArr[0]?.name || null,
              assetType: Array.isArray(assetsArr) && assetsArr[0]?.type || null,
            });
          }
        });

        await Promise.all(paPromises);

        // Step 4: Enrich SmartList items with project/asset info
        const enrichedData = smartListResult.data.map((item) => {
          const paId = item.project_asset_id;
          const enrichment = paId ? projectAssetMap.get(paId) : null;

          return {
            ...item,
            projectName: enrichment?.projectName ?? null,
            projectRegion: enrichment?.projectRegion ?? null,
            assetName: enrichment?.assetName ?? null,
            assetType: enrichment?.assetType ?? null,
          };
        });

        return {
          data: enrichedData,
          total: enrichedData.length,
        };
      }

      // Without expand
      const result = await baseQuery.execute();

      if (result.error) {
        return { data: [], total: 0 };
      }

      return {
        data: result.data ?? [],
        total: result.data?.length ?? 0,
      };
    }),

  getById: protectedProcedure
    .input(getSmartListByIdInput)
    .handler(async ({ input }) => {
      // Get SmartList item
      const result = await db
        .from(SmartList)
        .list()
        .where(eq(SmartList.id, input.id))
        .single()
        .execute();

      if (result.error || !result.data) {
        throw new Error(`SmartList item not found: ${input.id}`);
      }

      // Fetch ProjectAssets with expanded Projects/Assets
      let projectName: string | null = null;
      let assetName: string | null = null;

      if (result.data.project_asset_id) {
        const paResult = await db
          .from(ProjectAssets)
          .list()
          .where(eq(ProjectAssets.id, result.data.project_asset_id))
          .expand(Projects, p => p.select({ name: Projects.name }))
          .expand(Assets, a => a.select({ name: Assets.name }))
          .single()
          .execute();

        if (paResult.data) {
          const projectsArr = (paResult.data as any).Projects;
          const assetsArr = (paResult.data as any).Assets;
          projectName = Array.isArray(projectsArr) && projectsArr[0]?.name || null;
          assetName = Array.isArray(assetsArr) && assetsArr[0]?.name || null;
        }
      }

      return {
        ...result.data,
        projectName,
        assetName,
      };
    }),

  getStatusSummary: protectedProcedure
    .input(getStatusSummaryInput)
    .handler(async ({ input }) => {
      const { project_asset_id } = input;

      let query = db.from(SmartList).list().top(1000);
      
      if (project_asset_id) {
        query = query.where(eq(SmartList.project_asset_id, project_asset_id));
      }

      const result = await query.execute();

      if (result.error || !result.data) {
        return {
          total: 0,
          byStatus: { Open: 0, Closed: 0, Deferred: 0 },
          byPriority: { High: 0, Medium: 0, Low: 0 },
          byPriorityAndStatus: {
            High: { Open: 0, Closed: 0 },
            Medium: { Open: 0, Closed: 0 },
            Low: { Open: 0, Closed: 0 },
          },
        };
      }

      const data = result.data;

      const byStatus = { Open: 0, Closed: 0, Deferred: 0 };
      const byPriority = { High: 0, Medium: 0, Low: 0 };
      const byPriorityAndStatus = {
        High: { Open: 0, Closed: 0 },
        Medium: { Open: 0, Closed: 0 },
        Low: { Open: 0, Closed: 0 },
      };

      for (const item of data) {
        const itemStatus = item.status as keyof typeof byStatus;
        const itemPriority = item.priority as keyof typeof byPriority;

        if (itemStatus in byStatus) byStatus[itemStatus]++;
        if (itemPriority in byPriority) byPriority[itemPriority]++;

        if (itemPriority in byPriorityAndStatus && (itemStatus === "Open" || itemStatus === "Closed")) {
          byPriorityAndStatus[itemPriority][itemStatus]++;
        }
      }

      return {
        total: data.length,
        byStatus,
        byPriority,
        byPriorityAndStatus,
      };
    }),
};
