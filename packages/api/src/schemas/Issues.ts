import { fmTableOccurrence, numberField, textField, dateField, timestampField } from "@proofkit/fmodata";
import { z } from "zod/v4";

// ============================================================================
// Enum Schemas
// ============================================================================

export const IssuePrioritySchema = z.enum(["L", "M", "H"]);
export type IssuePriority = z.infer<typeof IssuePrioritySchema>;

export const IssueStatusSchema = z.enum(["NEW", "ASSIGNED", "RESOLVED", "CLOSED"]);
export type IssueStatus = z.infer<typeof IssueStatusSchema>;

// ============================================================================
// Table Occurrence: Issues
// ============================================================================

export const Issues = fmTableOccurrence("Issues", {
  "id": textField().primaryKey(),
  "issue_id": textField(),
  "project_asset_id": textField(),
  "system": textField(),
  "priority": textField()
    .writeValidator(IssuePrioritySchema)
    .readValidator(
      z.string().transform((val) => {
        const result = IssuePrioritySchema.safeParse(val);
        return result.success ? result.data : null;
      })
    ),
  "short_description": textField(),
  "description": textField(),
  "status": textField()
    .writeValidator(IssueStatusSchema)
    .readValidator(
      z.string().transform((val) => {
        const result = IssueStatusSchema.safeParse(val);
        return result.success ? result.data : null;
      })
    ),
  "is_closed": numberField(), // 0 or 1 (boolean)
  "date_opened": dateField(), // DATE field from FileMaker
  "timestamp_modified": timestampField(), // TIMESTAMP field from FileMaker
}, {
  navigationPaths: ["ProjectAssets"]
});
