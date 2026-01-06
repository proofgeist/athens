import { z } from "zod";
import { eq, and } from "@proofkit/fmodata";
import { protectedProcedure } from "../index";
import { db, Projects } from "../db";
import { ProjectStatusSchema } from "../schemas/Projects";

// Input schemas
const listProjectsInput = z.object({
  region: z.string().optional(),
  risk_level: z.string().optional(),
  status: ProjectStatusSchema.optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

const getProjectByIdInput = z.object({
  id: z.string(),
});

// Projects router (protected - requires authentication)
export const projectsRouter = {
  list: protectedProcedure
    .input(listProjectsInput)
    .handler(async ({ input }) => {
      const { region, risk_level, status, limit, offset } = input;

      // Build filters
      const filters = [];
      if (region) filters.push(eq(Projects.region, region));
      if (risk_level) filters.push(eq(Projects.risk_level, risk_level));
      if (status) filters.push(eq(Projects.status, status));

      let query = db.from(Projects).list().top(limit).skip(offset);
      
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
    .input(getProjectByIdInput)
    .handler(async ({ input }) => {
      const result = await db
        .from(Projects)
        .list()
        .where(eq(Projects.id, input.id))
        .single()
        .execute();

      if (result.error || !result.data) {
        throw new Error(`Project not found: ${input.id}`);
      }

      return result.data;
    }),
};
