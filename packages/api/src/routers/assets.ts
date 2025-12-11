import { z } from "zod";
import { eq, and } from "@proofkit/fmodata";
import { protectedProcedure } from "../index";
import { db, Assets } from "../db";

// Input schemas
const listAssetsInput = z.object({
  type: z.string().optional(),
  location: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

const getAssetByIdInput = z.object({
  id: z.string(),
});

// Assets router (protected - requires authentication)
export const assetsRouter = {
  list: protectedProcedure
    .input(listAssetsInput)
    .handler(async ({ input }) => {
      const { type, location, limit, offset } = input;

      const filters = [];
      if (type) filters.push(eq(Assets.type, type));
      if (location) filters.push(eq(Assets.location, location));

      let query = db.from(Assets).list().top(limit).skip(offset);
      
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
    .input(getAssetByIdInput)
    .handler(async ({ input }) => {
      const result = await db
        .from(Assets)
        .list()
        .where(eq(Assets.id, input.id))
        .single()
        .execute();

      if (result.error || !result.data) {
        throw new Error(`Asset not found: ${input.id}`);
      }

      return result.data;
    }),
};
