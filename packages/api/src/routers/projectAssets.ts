import { z } from "zod";
import { publicProcedure } from "../index";
import { ProjectAssetsLayout } from "@athens/fm-client";

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

// ProjectAssets router
export const projectAssetsRouter = {
  list: publicProcedure
    .input(listProjectAssetsInput)
    .handler(async ({ input }) => {
      const { project_id, asset_id, limit, offset } = input;

      const query: Record<string, string> = {};
      
      if (project_id) query.project_id = project_id;
      if (asset_id) query.asset_id = asset_id;

      try {
        const queryArray = Object.keys(query).length > 0 ? [query] : [{ id: "*" }];
        
        const result = await ProjectAssetsLayout.find({
          query: queryArray,
          limit,
          offset,
        });

        const data = result.data || [];
        return {
          data,
          total: result.dataInfo?.foundCount || data.length,
        };
      } catch (error) {
        return {
          data: [] as Array<{ recordId: string; fieldData: { id: string; project_id: string; asset_id: string; raptor_checklist_completion: string | number; sit_completion: string | number; doc_verification_completion: string | number; checklist_remaining: string | number; checklist_closed: string | number; checklist_non_conforming: string | number; checklist_not_applicable: string | number; checklist_deferred: string | number } }>,
          total: 0,
        };
      }
    }),

  getById: publicProcedure
    .input(getProjectAssetByIdInput)
    .handler(async ({ input }) => {
      const result = await ProjectAssetsLayout.find({
        query: [{ id: input.id }],
        limit: 1,
      });

      if (!result.data || result.data.length === 0) {
        throw new Error(`ProjectAsset not found: ${input.id}`);
      }

      return result.data[0];
    }),

  // Get summary stats for dashboard
  getSummaryStats: publicProcedure.handler(async () => {
    try {
      const result = await ProjectAssetsLayout.find({
        query: [{ id: "*" }], // Get all
        limit: 1000,
      });

      const data = result.data || [];
      const total = data.length;
      
      // Calculate averages
      const avgCompletion = data.reduce((sum, pa) => {
        const val = typeof pa.fieldData.raptor_checklist_completion === 'string' 
          ? parseFloat(pa.fieldData.raptor_checklist_completion) 
          : pa.fieldData.raptor_checklist_completion;
        return sum + (val || 0);
      }, 0) / (total || 1);

      const avgSitCompletion = data.reduce((sum, pa) => {
        const val = typeof pa.fieldData.sit_completion === 'string' 
          ? parseFloat(pa.fieldData.sit_completion) 
          : pa.fieldData.sit_completion;
        return sum + (val || 0);
      }, 0) / (total || 1);

      const avgDocVerification = data.reduce((sum, pa) => {
        const val = typeof pa.fieldData.doc_verification_completion === 'string' 
          ? parseFloat(pa.fieldData.doc_verification_completion) 
          : pa.fieldData.doc_verification_completion;
        return sum + (val || 0);
      }, 0) / (total || 1);

      return {
        totalProjects: total,
        avgRaptorCompletion: Math.round(avgCompletion),
        avgSitCompletion: Math.round(avgSitCompletion),
        avgDocVerification: Math.round(avgDocVerification),
      };
    } catch (error) {
      return {
        totalProjects: 0,
        avgRaptorCompletion: 0,
        avgSitCompletion: 0,
        avgDocVerification: 0,
      };
    }
  }),
};
