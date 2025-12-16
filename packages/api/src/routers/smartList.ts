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
  raptor_checklist_completion: z.number().nullable().optional(),
  sit_completion: z.number().nullable().optional(),
  doc_verification_completion: z.number().nullable().optional(),
  checklist_remaining: z.number().nullable().optional(),
  checklist_closed: z.number().nullable().optional(),
  checklist_non_conforming: z.number().nullable().optional(),
  checklist_not_applicable: z.number().nullable().optional(),
  checklist_deferred: z.number().nullable().optional(),
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

      // Execute with or without related data using nested expands
      if (includeRelated) {
        const smartListResult = await baseQuery
          .expand(ProjectAssets, (paBuilder) =>
            paBuilder
              .expand(Projects, (pBuilder) =>
                pBuilder.select({
                  name: Projects.name,
                  region: Projects.region,
                })
              )
              .expand(Assets, (aBuilder) =>
                aBuilder.select({
                  name: Assets.name,
                  type: Assets.type,
                })
              )
          )
          .execute();

        if (smartListResult.error || !smartListResult.data) {
          return { data: [], total: 0 };
        }

        // Enrich SmartList items with project/asset info from nested expands
        const enrichedData = smartListResult.data.map((item) => {
          const paArray = item.ProjectAssets;
          let projectName: string | null = null;
          let projectRegion: string | null = null;
          let assetName: string | null = null;
          let assetType: string | null = null;

          if (Array.isArray(paArray) && paArray.length > 0) {
            const pa = paArray[0];
            
            // Extract expanded Projects data
            if (pa?.Projects && Array.isArray(pa?.Projects) && pa?.Projects.length > 0) {
              const project = pa.Projects[0];
              projectName = project?.name ?? null;
              projectRegion = project?.region ?? null;
            }
            
            // Extract expanded Assets data
            if (pa?.Assets && Array.isArray(pa?.Assets) && pa?.Assets.length > 0) {
              const asset = pa?.Assets[0];
              assetName = asset?.name ?? null;
              assetType = asset?.type ?? null;
            }
          }

          // Extract only the SmartList fields, excluding ProjectAssets
          const { ProjectAssets, ...smartListItem } = item;
          
          return {
            ...smartListItem,
            projectName,
            projectRegion,
            assetName,
            assetType,
            raptor_checklist_completion: ProjectAssets?.[0]?.raptor_checklist_completion ?? 0,
            sit_completion: ProjectAssets?.[0]?.sit_completion ?? 0,
            doc_verification_completion: ProjectAssets?.[0]?.doc_verification_completion ?? 0,
            checklist_remaining: ProjectAssets?.[0]?.checklist_remaining ?? 0,
            checklist_closed: ProjectAssets?.[0]?.checklist_closed ?? 0,
            checklist_non_conforming: ProjectAssets?.[0]?.checklist_non_conforming ?? 0,
            checklist_not_applicable: ProjectAssets?.[0]?.checklist_not_applicable ?? 0,
            checklist_deferred: ProjectAssets?.[0]?.checklist_deferred ?? 0,
          };
        });

        // Validate and return enriched data
        const output = {
          data: enrichedData,
          total: enrichedData.length,
        };
        
        return listSmartListOutput.parse(output);
      }

      // Without expand
      const result = await baseQuery.execute();

      if (result.error) {
        return listSmartListOutput.parse({ data: [], total: 0 });
      }

      const output = {
        data: result.data ?? [],
        total: result.data?.length ?? 0,
      };

      return listSmartListOutput.parse(output);
    }),

  getById: protectedProcedure
    .input(getSmartListByIdInput)
    .handler(async ({ input }) => {
      const result = await db
        .from(SmartList)
        .list()
        .where(eq(SmartList.id, input.id))
        .expand(ProjectAssets, (paBuilder) =>
          paBuilder
            .expand(Projects, (pBuilder) =>
              pBuilder.select({
                name: Projects.name,
                region: Projects.region,
                status: Projects.status,
              })
            )
            .expand(Assets, (aBuilder) =>
              aBuilder.select({
                name: Assets.name,
                type: Assets.type,
              })
            )
        )
        .single()
        .execute();

      if (result.error || !result.data) {
        throw new Error(`SmartList item not found: ${input.id}`);
      }

      return result.data;
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
