import { z } from "zod";
import { eq } from "@proofkit/fmodata";
import { protectedProcedure } from "../index";
import { db, Issues } from "../db";
import { IssuePrioritySchema, IssueStatusSchema } from "../schemas/Issues";

// Input schemas
const listByProjectAssetInput = z.object({
  projectAssetId: z.string(),
});

// Output schemas
export const issueItemSchema = z.object({
  id: z.string(),
  issue_id: z.string().nullable(),
  project_asset_id: z.string().nullable(),
  system: z.string().nullable(),
  priority: IssuePrioritySchema.nullable(), // L, M, H
  short_description: z.string().nullable(),
  description: z.string().nullable(),
  status: IssueStatusSchema.nullable(), // NEW, ASSIGNED, RESOLVED, CLOSED
  is_closed: z.number().nullable(), // 0 or 1
  date_opened: z.string().nullable(),
  timestamp_modified: z.string().nullable(),
});

const listByProjectAssetOutput = z.object({
  data: z.array(issueItemSchema),
  total: z.number(),
});

// Summary output schema for charts
const issueSummarySchema = z.object({
  // Count by priority and status
  high_new: z.number(),
  high_assigned: z.number(),
  high_resolved: z.number(),
  high_closed: z.number(),
  medium_new: z.number(),
  medium_assigned: z.number(),
  medium_resolved: z.number(),
  medium_closed: z.number(),
  low_new: z.number(),
  low_assigned: z.number(),
  low_resolved: z.number(),
  low_closed: z.number(),
  // Totals
  total_open: z.number(),
  total_closed: z.number(),
  total: z.number(),
});

// Issues router (protected - requires authentication)
export const issuesRouter = {
  listByProjectAsset: protectedProcedure
    .input(listByProjectAssetInput)
    .output(listByProjectAssetOutput)
    .handler(async ({ input }) => {
      const result = await db
        .from(Issues)
        .list()
        .where(eq(Issues.project_asset_id, input.projectAssetId))
        .top(1000)
        .execute();

      if (result.error || !result.data) {
        return { data: [], total: 0 };
      }

      const data = result.data.map((item) => issueItemSchema.parse(item));

      return {
        data,
        total: data.length,
      };
    }),

  getSummary: protectedProcedure
    .input(listByProjectAssetInput)
    .output(issueSummarySchema)
    .handler(async ({ input }) => {
      const result = await db
        .from(Issues)
        .list()
        .where(eq(Issues.project_asset_id, input.projectAssetId))
        .top(1000)
        .execute();

      if (result.error || !result.data) {
        return {
          high_new: 0,
          high_assigned: 0,
          high_resolved: 0,
          high_closed: 0,
          medium_new: 0,
          medium_assigned: 0,
          medium_resolved: 0,
          medium_closed: 0,
          low_new: 0,
          low_assigned: 0,
          low_resolved: 0,
          low_closed: 0,
          total_open: 0,
          total_closed: 0,
          total: 0,
        };
      }

      const issues = result.data;

      // Initialize counters
      const summary = {
        high_new: 0,
        high_assigned: 0,
        high_resolved: 0,
        high_closed: 0,
        medium_new: 0,
        medium_assigned: 0,
        medium_resolved: 0,
        medium_closed: 0,
        low_new: 0,
        low_assigned: 0,
        low_resolved: 0,
        low_closed: 0,
        total_open: 0,
        total_closed: 0,
        total: issues.length,
      };

      // Count issues by priority and status
      for (const issue of issues) {
        const priority = issue.priority?.toUpperCase() || "";
        const status = issue.status?.toUpperCase() || "";
        const isClosed = issue.is_closed === 1 || status === "CLOSED";

        // Track open/closed totals
        if (isClosed) {
          summary.total_closed++;
        } else {
          summary.total_open++;
        }

        // Categorize by priority and status
        if (priority === "H") {
          if (status === "NEW") summary.high_new++;
          else if (status === "ASSIGNED") summary.high_assigned++;
          else if (status === "RESOLVED") summary.high_resolved++;
          else if (status === "CLOSED") summary.high_closed++;
        } else if (priority === "M") {
          if (status === "NEW") summary.medium_new++;
          else if (status === "ASSIGNED") summary.medium_assigned++;
          else if (status === "RESOLVED") summary.medium_resolved++;
          else if (status === "CLOSED") summary.medium_closed++;
        } else if (priority === "L") {
          if (status === "NEW") summary.low_new++;
          else if (status === "ASSIGNED") summary.low_assigned++;
          else if (status === "RESOLVED") summary.low_resolved++;
          else if (status === "CLOSED") summary.low_closed++;
        }
      }

      return issueSummarySchema.parse(summary);
    }),
};
