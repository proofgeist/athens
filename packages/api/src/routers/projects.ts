import { z } from "zod";
import { publicProcedure } from "../index";
import { ProjectsLayout } from "@athens/fm-client";

// Input schemas
const listProjectsInput = z.object({
  region: z.string().optional(),
  phase: z.string().optional(),
  risk_level: z.string().optional(),
  status: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

const getProjectByIdInput = z.object({
  id: z.string(),
});

// Projects router
export const projectsRouter = {
  list: publicProcedure
    .input(listProjectsInput)
    .handler(async ({ input }) => {
      const { region, phase, risk_level, status, limit, offset } = input;

      // Build query for FileMaker Data API
      const query: Record<string, string> = {};
      
      if (region) query.region = region;
      if (phase) query.phase = phase;
      if (risk_level) query.risk_level = risk_level;
      if (status) query.status = status;

      try {
        // If no filters, use wildcard to get all
        const queryArray = Object.keys(query).length > 0 ? [query] : [{ id: "*" }];
        
        const result = await ProjectsLayout.find({
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
        // Return empty if no records found
        return {
          data: [] as Array<{ recordId: string; fieldData: { id: string; name: string; region: string; phase: string; risk_level: string; overall_completion: string | number; readiness_score: string | number; status: string; created_at: string; updated_at: string } }>,
          total: 0,
        };
      }
    }),

  getById: publicProcedure
    .input(getProjectByIdInput)
    .handler(async ({ input }) => {
      const result = await ProjectsLayout.find({
        query: [{ id: input.id }],
        limit: 1,
      });

      if (!result.data || result.data.length === 0) {
        throw new Error(`Project not found: ${input.id}`);
      }

      return result.data[0];
    }),
};
