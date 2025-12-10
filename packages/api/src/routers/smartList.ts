import { z } from "zod";
import { protectedProcedure } from "../index";
import { SmartListLayout } from "@athens/fm-client";

// Input schemas
const listSmartListInput = z.object({
  project_asset_id: z.string().optional(),
  priority: z.enum(["High", "Medium", "Low"]).optional(),
  status: z.enum(["Open", "Closed", "Deferred"]).optional(),
  system_group: z.string().optional(),
  milestone_target: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

const getSmartListByIdInput = z.object({
  id: z.string(),
});

const getStatusSummaryInput = z.object({
  project_asset_id: z.string().optional(),
});

// SmartList router (protected - requires authentication)
export const smartListRouter = {
  list: protectedProcedure
    .input(listSmartListInput)
    .handler(async ({ input }) => {
      const { project_asset_id, priority, status, system_group, milestone_target, limit, offset } = input;

      const query: Record<string, string> = {};
      
      if (project_asset_id) query.project_asset_id = project_asset_id;
      if (priority) query.priority = priority;
      if (status) query.status = status;
      if (system_group) query.system_group = system_group;
      if (milestone_target) query.milestone_target = milestone_target;

      try {
        const queryArray = Object.keys(query).length > 0 ? [query] : [{ id: "*" }];
        
        const result = await SmartListLayout.find({
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
          data: [] as Array<{ recordId: string; fieldData: { id: string; project_asset_id: string; title: string; description: string; priority: string; status: string; due_date: string; milestone_target: string; system_group: string; assigned_to: string; created_at: string; updated_at: string } }>,
          total: 0,
        };
      }
    }),

  getById: protectedProcedure
    .input(getSmartListByIdInput)
    .handler(async ({ input }) => {
      const result = await SmartListLayout.find({
        query: [{ id: input.id }],
        limit: 1,
      });

      if (!result.data || result.data.length === 0) {
        throw new Error(`SmartList item not found: ${input.id}`);
      }

      return result.data[0];
    }),

  // Get status summary (counts by status/priority)
  getStatusSummary: protectedProcedure
    .input(getStatusSummaryInput)
    .handler(async ({ input }) => {
      const { project_asset_id } = input;

      try {
        const queryArray = project_asset_id 
          ? [{ project_asset_id }] 
          : [{ id: "*" }];
          
        const result = await SmartListLayout.find({
          query: queryArray,
          limit: 1000,
        });

        const data = result.data || [];

        // Count by status
        const byStatus = {
          Open: 0,
          Closed: 0,
          Deferred: 0,
        };

        // Count by priority
        const byPriority = {
          High: 0,
          Medium: 0,
          Low: 0,
        };

        // Count by priority and status
        const byPriorityAndStatus = {
          High: { Open: 0, Closed: 0 },
          Medium: { Open: 0, Closed: 0 },
          Low: { Open: 0, Closed: 0 },
        };

        for (const item of data) {
          const status = item.fieldData.status as keyof typeof byStatus;
          const priority = item.fieldData.priority as keyof typeof byPriority;

          if (status in byStatus) byStatus[status]++;
          if (priority in byPriority) byPriority[priority]++;

          if (priority in byPriorityAndStatus && (status === 'Open' || status === 'Closed')) {
            byPriorityAndStatus[priority][status]++;
          }
        }

        return {
          total: data.length,
          byStatus,
          byPriority,
          byPriorityAndStatus,
        };
      } catch (error) {
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
    }),
};
