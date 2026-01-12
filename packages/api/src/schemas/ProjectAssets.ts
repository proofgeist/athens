import { fmTableOccurrence, textField, numberField } from "@proofkit/fmodata";
import { z } from "zod/v4";

// ============================================================================
// Action Items JSON Schema
// ============================================================================

const ActionItemStatusSchema = z.object({
  highOpen: z.number(),
  highClosed: z.number(),
  mediumOpen: z.number(),
  mediumClosed: z.number(),
  lowOpen: z.number(),
  lowClosed: z.number(),
});

const ActionItemByMilestoneSchema = z.object({
  milestone: z.string(),
  open: z.number(),
  closed: z.number(),
});

export const ActionItemsJsonSchema = z.object({
  actionItemStatus: ActionItemStatusSchema,
  actionItemsByMilestone: z.array(ActionItemByMilestoneSchema),
});

// ============================================================================
// System Progress JSON Schema
// ============================================================================

const SystemProgressItemSchema = z.object({
  system: z.string(),
  progress: z.number(),
});

export const SystemProgressJsonSchema = z.object({
  docVerification: z.array(SystemProgressItemSchema),
  checklist: z.array(SystemProgressItemSchema),
  sit: z.array(SystemProgressItemSchema),
});

// ============================================================================
// Table Occurrence: ProjectAssets
// ============================================================================

export const ProjectAssets = fmTableOccurrence("ProjectAssets", {
    "project_id": textField(),
    "asset_id": textField(),
    "sit_closed": numberField(),
    "doc_closed": numberField(),
    "checklist_remaining": numberField().readOnly(),
    "checklist_closed": numberField(),
    "checklist_non_conforming": numberField(),
    "checklist_not_applicable": numberField(),
    "checklist_deferred": numberField(),
    "id": textField().primaryKey(),
    "overall_completion": numberField().readOnly(),
    "checklist_percent": numberField().readOnly(),
    "checklist_total": numberField(),
    "sit_remaining": numberField().readOnly(),
    "sit_total": numberField(),
    "sit_percent": numberField().readOnly(),
    "doc_remaining": numberField().readOnly(),
    "doc_total": numberField(),
    "doc_percent": numberField().readOnly(),
    "action_items_json": textField().writeValidator(
      z.string().refine(
        (val) => {
          if (!val) return true; // Empty string is valid
          try {
            const parsed = JSON.parse(val);
            ActionItemsJsonSchema.parse(parsed);
            return true;
          } catch {
            return false;
          }
        },
        { message: "Invalid action items JSON format" }
      )
    ).readValidator(
      z.string().transform((val) => {
        if (!val) return null;
        try {
          return ActionItemsJsonSchema.parse(JSON.parse(val));
        } catch {
          return null;
        }
      })
    ),
    "system_progress_json": textField().writeValidator(
      z.string().refine(
        (val) => {
          if (!val) return true; // Empty string is valid
          try {
            const parsed = JSON.parse(val);
            SystemProgressJsonSchema.parse(parsed);
            return true;
          } catch {
            return false;
          }
        },
        { message: "Invalid system progress JSON format" }
      )
    ).readValidator(
      z.string().transform((val) => {
        if (!val) return null;
        try {
          return SystemProgressJsonSchema.parse(JSON.parse(val));
        } catch {
          return null;
        }
      })
    ),
}, {
  navigationPaths: ["Projects", "Assets", "Issues", "SmartList"]
});
