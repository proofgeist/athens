import { fmTableOccurrence, textField, numberField, dateField } from "@proofkit/fmodata";

// ============================================================================
// Table Occurrence: IssuesSummary
// ============================================================================

export const IssuesSummary = fmTableOccurrence("IssuesSummary", {
    "project_asset_id": textField().entityId("FMFID:4296032389"),
    "summary_date": dateField().entityId("FMFID:8590999685"),
    "total_items": numberField().entityId("FMFID:12885966981"),
    "open_high": numberField().entityId("FMFID:17180934277"),
    "closed_high": numberField().entityId("FMFID:21475901573"),
    "open_medium": numberField().entityId("FMFID:25770868869"),
    "closed_medium": numberField().entityId("FMFID:30065836165"),
    "open_low": numberField().entityId("FMFID:34360803461"),
    "closed_low": numberField().entityId("FMFID:38655770757"),
    "system_group": textField().entityId("FMFID:42950738053"),
    "system_progress": numberField().entityId("FMFID:47245705349"),
    "id": textField().primaryKey().entityId("FMFID:51540672645")
}, {
  entityId: "FMTID:1065093",
  navigationPaths: ["ProjectAssets"]
});
