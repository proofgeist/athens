import { fmTableOccurrence, textField, numberField } from "@proofkit/fmodata";

export const ProjectAssets = fmTableOccurrence("ProjectAssets", {
  id: textField().primaryKey(),
  project_id: textField().notNull(),
  asset_id: textField().notNull(),
  raptor_checklist_completion: numberField(),
  sit_completion: numberField(),
  doc_verification_completion: numberField(),
  checklist_remaining: numberField(),
  checklist_closed: numberField(),
  checklist_non_conforming: numberField(),
  checklist_not_applicable: numberField(),
  checklist_deferred: numberField(),
}, { navigationPaths: ["Projects", "Assets", "IssuesSummary", "SmartList"] });

