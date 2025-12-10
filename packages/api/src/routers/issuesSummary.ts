import { z } from "zod";
import { publicProcedure } from "../index";
import { IssuesSummaryLayout } from "@athens/fm-client";

// Input schemas
const getByProjectAssetInput = z.object({
  project_asset_id: z.string(),
});

const getSystemProgressInput = z.object({
  project_asset_id: z.string(),
});

// IssuesSummary router
export const issuesSummaryRouter = {
  // Get latest summary for a project asset
  getByProjectAsset: publicProcedure
    .input(getByProjectAssetInput)
    .handler(async ({ input }) => {
      try {
        const result = await IssuesSummaryLayout.find({
          query: [{ project_asset_id: input.project_asset_id }],
          limit: 100,
        });

        if (!result.data || result.data.length === 0) {
          return null;
        }

        // Get the latest summary (by summary_date)
        const sorted = [...result.data].sort((a, b) => {
          return b.fieldData.summary_date.localeCompare(a.fieldData.summary_date);
        });

        return sorted[0];
      } catch (error) {
        return null;
      }
    }),

  // Get progress per system group
  getSystemProgress: publicProcedure
    .input(getSystemProgressInput)
    .handler(async ({ input }) => {
      try {
        const result = await IssuesSummaryLayout.find({
          query: [{ project_asset_id: input.project_asset_id }],
          limit: 100,
        });

        const data = result.data || [];

        // Group by system_group and get latest progress for each
        const systemProgressMap = new Map<string, number>();

        for (const item of data) {
          const group = item.fieldData.system_group;
          const progress = typeof item.fieldData.system_progress === 'string'
            ? parseFloat(item.fieldData.system_progress)
            : item.fieldData.system_progress;

          // Keep the latest value (assuming they're sorted or we take max)
          const current = systemProgressMap.get(group) || 0;
          if (progress > current) {
            systemProgressMap.set(group, progress);
          }
        }

        // Convert to array
        const systemProgress = Array.from(systemProgressMap.entries()).map(([group, progress]) => ({
          system_group: group,
          progress,
        }));

        return {
          systemProgress,
        };
      } catch (error) {
        return {
          systemProgress: [],
        };
      }
    }),

  // Get aggregated action item counts
  getActionItemCounts: publicProcedure
    .input(getByProjectAssetInput)
    .handler(async ({ input }) => {
      try {
        const result = await IssuesSummaryLayout.find({
          query: [{ project_asset_id: input.project_asset_id }],
          limit: 100,
        });

        const data = result.data || [];

        // Aggregate counts across all summaries
        let openHigh = 0, closedHigh = 0;
        let openMedium = 0, closedMedium = 0;
        let openLow = 0, closedLow = 0;
        let totalItems = 0;

        for (const item of data) {
          const fd = item.fieldData;
          openHigh += typeof fd.open_high === 'string' ? parseInt(fd.open_high) : fd.open_high;
          closedHigh += typeof fd.closed_high === 'string' ? parseInt(fd.closed_high) : fd.closed_high;
          openMedium += typeof fd.open_medium === 'string' ? parseInt(fd.open_medium) : fd.open_medium;
          closedMedium += typeof fd.closed_medium === 'string' ? parseInt(fd.closed_medium) : fd.closed_medium;
          openLow += typeof fd.open_low === 'string' ? parseInt(fd.open_low) : fd.open_low;
          closedLow += typeof fd.closed_low === 'string' ? parseInt(fd.closed_low) : fd.closed_low;
          totalItems += typeof fd.total_items === 'string' ? parseInt(fd.total_items) : fd.total_items;
        }

        return {
          totalItems,
          high: { open: openHigh, closed: closedHigh },
          medium: { open: openMedium, closed: closedMedium },
          low: { open: openLow, closed: closedLow },
        };
      } catch (error) {
        return {
          totalItems: 0,
          high: { open: 0, closed: 0 },
          medium: { open: 0, closed: 0 },
          low: { open: 0, closed: 0 },
        };
      }
    }),
};
