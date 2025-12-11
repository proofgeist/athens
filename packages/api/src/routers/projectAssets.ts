import { z } from "zod";
import { eq, and } from "@proofkit/fmodata";
import { protectedProcedure } from "../index";
import { db, ProjectAssets } from "../db";

// Input schemas
const listProjectAssetsInput = z.object({
  project_id: z.string().optional(),
  asset_id: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

const getProjectAssetByIdInput = z.object({
  id: z.string(),
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

      let query = db.from(ProjectAssets).list().top(limit).skip(offset);
      
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
      sumRaptor += pa.raptor_checklist_completion ?? 0;
      sumSit += pa.sit_completion ?? 0;
      sumDoc += pa.doc_verification_completion ?? 0;
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
};
