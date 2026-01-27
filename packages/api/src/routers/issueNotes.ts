import { z } from "zod";
import { eq } from "@proofkit/fmodata";
import { protectedProcedure } from "../index";
import { db, IssueNotes } from "../db";

// Input schemas
const listByIssueInput = z.object({
  issueId: z.string(),
});

const createNoteInput = z.object({
  issueId: z.string(),
  note: z.string().min(1, "Note cannot be empty"),
  createdBy: z.string(),
});

// Output schemas
export const issueNoteSchema = z.object({
  id: z.string(),
  issue_id: z.string().nullable(),
  note: z.string().nullable(),
  creation_timestamp: z.string().nullable(),
  created_by: z.string().nullable(),
});

const listByIssueOutput = z.object({
  data: z.array(issueNoteSchema),
  total: z.number(),
});

const createNoteOutput = z.object({
  success: z.boolean(),
  id: z.string().optional(),
});

// Issue Notes router (protected - requires authentication)
export const issueNotesRouter = {
  listByIssue: protectedProcedure
    .input(listByIssueInput)
    .output(listByIssueOutput)
    .handler(async ({ input }) => {
      try {
        const result = await db
          .from(IssueNotes)
          .list()
          .where(eq(IssueNotes.issue_id, input.issueId))
          .top(1000)
          .execute();

        // Handle error or empty/null data from OData
        if (result.error || !result.data) {
          // Return empty result instead of throwing - this is expected when no notes exist
          return { data: [], total: 0 };
        }

        // Handle case where data is not an array (shouldn't happen, but be defensive)
        if (!Array.isArray(result.data)) {
          return { data: [], total: 0 };
        }

        // Parse and sort by creation timestamp (oldest first for chat-like display)
        const data = result.data
          .map((item) => issueNoteSchema.parse(item))
          .sort((a, b) => {
            // Handle missing timestamps - put them at the end
            if (!a.creation_timestamp && !b.creation_timestamp) return 0;
            if (!a.creation_timestamp) return 1; // a goes to end
            if (!b.creation_timestamp) return -1; // b goes to end
            
            // Sort ascending: oldest first
            const timeA = new Date(a.creation_timestamp).getTime();
            const timeB = new Date(b.creation_timestamp).getTime();
            return timeA - timeB;
          });

        return {
          data,
          total: data.length,
        };
      } catch (error) {
        // Log the error for debugging but return empty result
        // This handles cases where OData throws an exception for empty results
        console.error("Error fetching notes for issue:", input.issueId, error);
        return { data: [], total: 0 };
      }
    }),

  create: protectedProcedure
    .input(createNoteInput)
    .output(createNoteOutput)
    .handler(async ({ input }) => {
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      
      try {
        const result = await db
          .from(IssueNotes)
          .insert({
            issue_id: input.issueId,
            note: input.note,
            creation_timestamp: now,
            created_by: input.createdBy,
          })
          .execute();

        if (result.error) {
          return { success: false };
        }

        return {
          success: true,
          id: result.data?.id || id,
        };
      } catch (error) {
        console.error("Error creating note:", error);
        return { success: false };
      }
    }),
};
