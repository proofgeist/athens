import {
  dateField,
  fmTableOccurrence,
  numberField,
  textField,
  timestampField,
} from "@proofkit/fmodata";
import { z } from "zod/v4";
// ============================================================================
// Project Status Enum
// ============================================================================

export const ProjectStatusSchema = z.enum([
	"Closeable",
	"Verbal",
	"Before Start",
	"In Progress",
	"Completed",
	"Cancelled",
	"Closed",
	"Unknown",
]);

// ============================================================================
// Table Occurrence: Projects
// ============================================================================

export const Projects = fmTableOccurrence(
  "Projects",
  {
    name: textField().entityId("FMFID:4296032386"),
    region: textField().entityId("FMFID:8590999682"),
    risk_level: textField().entityId("FMFID:17180934274"),
    status: textField().entityId("FMFID:30065836162").writeValidator(ProjectStatusSchema).readValidator(ProjectStatusSchema),
    created_at: timestampField().entityId("FMFID:34360803458"),
    updated_at: timestampField().entityId("FMFID:38655770754"),
    id: textField().primaryKey().entityId("FMFID:42950738050"),
    start_date: dateField().entityId("FMFID:47245705346"),
    end_date: dateField().entityId("FMFID:51540672642"),
    checklist_weight: numberField().entityId("FMFID:55835639938"),
    sit_weight: numberField().entityId("FMFID:60130607234"),
    doc_weight: numberField().entityId("FMFID:64425574530"),
  },
  {
    entityId: "FMTID:1065090",
    navigationPaths: ["ProjectAssets"],
  },
);
