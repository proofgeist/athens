import { z } from "zod";
import { protectedProcedure } from "../index";
import { AssetsLayout } from "@athens/fm-client";

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

      const query: Record<string, string> = {};
      
      if (type) query.type = type;
      if (location) query.location = location;

      try {
        const queryArray = Object.keys(query).length > 0 ? [query] : [{ id: "*" }];
        
        const result = await AssetsLayout.find({
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
          data: [] as Array<{ recordId: string; fieldData: { id: string; name: string; type: string; location: string } }>,
          total: 0,
        };
      }
    }),

  getById: protectedProcedure
    .input(getAssetByIdInput)
    .handler(async ({ input }) => {
      const result = await AssetsLayout.find({
        query: [{ id: input.id }],
        limit: 1,
      });

      if (!result.data || result.data.length === 0) {
        throw new Error(`Asset not found: ${input.id}`);
      }

      return result.data[0];
    }),
};
