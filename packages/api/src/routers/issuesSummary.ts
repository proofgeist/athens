import { z } from "zod";
import { eq, desc } from "@proofkit/fmodata";
import { protectedProcedure } from "../index";
import { db, IssuesSummary } from "../db";

// Input schemas
const getByProjectAssetInput = z.object({
  project_asset_id: z.string(),
});

const getSystemProgressInput = z.object({
  project_asset_id: z.string(),
});

// IssuesSummary router (protected - requires authentication)
export const issuesSummaryRouter = {
  // Get latest summary for a project asset
  getByProjectAsset: protectedProcedure
    .input(getByProjectAssetInput)
    .handler(async ({ input }) => {
      const result = await db
        .from(IssuesSummary)
        .list()
        .where(eq(IssuesSummary.project_asset_id, input.project_asset_id))
        .orderBy(desc(IssuesSummary.summary_date))
        .top(1)
        .execute();

      if (result.error || !result.data || result.data.length === 0) {
        return null;
      }

      return result.data[0] ?? null;
    }),

  // Get progress per system group
  getSystemProgress: protectedProcedure
    .input(getSystemProgressInput)
    .handler(async ({ input }) => {
      const result = await db
        .from(IssuesSummary)
        .list()
        .where(eq(IssuesSummary.project_asset_id, input.project_asset_id))
        .top(100)
        .execute();

      if (result.error || !result.data) {
        return { systemProgress: [] };
      }

      const data = result.data;

      // Group by system_group and get latest progress for each
      const systemProgressMap = new Map<string, number>();

      for (const item of data) {
        const group = item.system_group ?? "";
        const progress = item.system_progress ?? 0;

        // Keep the max value
        const current = systemProgressMap.get(group) || 0;
        if (progress > current) {
          systemProgressMap.set(group, progress);
        }
      }

      const systemProgress = Array.from(systemProgressMap.entries()).map(([group, progress]) => ({
        system_group: group,
        progress,
      }));

      return { systemProgress };
    }),

  // Get aggregated action item counts
  getActionItemCounts: protectedProcedure
    .input(getByProjectAssetInput)
    .handler(async ({ input }) => {
      const result = await db
        .from(IssuesSummary)
        .list()
        .where(eq(IssuesSummary.project_asset_id, input.project_asset_id))
        .top(100)
        .execute();

      if (result.error || !result.data) {
        return {
          totalItems: 0,
          high: { open: 0, closed: 0 },
          medium: { open: 0, closed: 0 },
          low: { open: 0, closed: 0 },
        };
      }

      const data = result.data;

      // Aggregate counts
      let openHigh = 0, closedHigh = 0;
      let openMedium = 0, closedMedium = 0;
      let openLow = 0, closedLow = 0;
      let totalItems = 0;

      for (const item of data) {
        openHigh += item.open_high ?? 0;
        closedHigh += item.closed_high ?? 0;
        openMedium += item.open_medium ?? 0;
        closedMedium += item.closed_medium ?? 0;
        openLow += item.open_low ?? 0;
        closedLow += item.closed_low ?? 0;
        totalItems += item.total_items ?? 0;
      }

      return {
        totalItems,
        high: { open: openHigh, closed: closedHigh },
        medium: { open: openMedium, closed: closedMedium },
        low: { open: openLow, closed: closedLow },
      };
    }),
};
