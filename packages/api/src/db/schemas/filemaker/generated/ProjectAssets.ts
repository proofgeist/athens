import { fmTableOccurrence, textField, numberField } from "@proofkit/fmodata";

// ============================================================================
// Table Occurrence: ProjectAssets
// ============================================================================

export const ProjectAssets = fmTableOccurrence("ProjectAssets", {
    "project_id": textField().entityId("FMFID:4296032388"),
    "asset_id": textField().entityId("FMFID:8590999684"),
    "raptor_checklist_completion": numberField().entityId("FMFID:12885966980"),
    "sit_completion": numberField().entityId("FMFID:17180934276"),
    "doc_verification_completion": numberField().entityId("FMFID:21475901572"),
    "checklist_remaining": numberField().entityId("FMFID:25770868868"),
    "checklist_closed": numberField().entityId("FMFID:30065836164"),
    "checklist_non_conforming": numberField().entityId("FMFID:34360803460"),
    "checklist_not_applicable": numberField().entityId("FMFID:38655770756"),
    "checklist_deferred": numberField().entityId("FMFID:42950738052"),
    "id": textField().primaryKey().entityId("FMFID:47245705348")
}, {
  entityId: "FMTID:1065092",
  navigationPaths: ["Projects", "Assets", "IssuesSummary", "SmartList"]
});
