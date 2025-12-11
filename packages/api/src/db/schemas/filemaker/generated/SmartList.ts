import { fmTableOccurrence, textField, dateField, timestampField } from "@proofkit/fmodata";

// ============================================================================
// Table Occurrence: SmartList
// ============================================================================

export const SmartList = fmTableOccurrence("SmartList", {
    "project_asset_id": textField().entityId("FMFID:4296032390"),
    "title": textField().entityId("FMFID:8590999686"),
    "description": textField().entityId("FMFID:12885966982"),
    "priority": textField().entityId("FMFID:17180934278"),
    "status": textField().entityId("FMFID:21475901574"),
    "due_date": dateField().entityId("FMFID:25770868870"),
    "milestone_target": textField().entityId("FMFID:30065836166"),
    "system_group": textField().entityId("FMFID:34360803462"),
    "assigned_to": textField().entityId("FMFID:38655770758"),
    "created_at": timestampField().entityId("FMFID:42950738054"),
    "updated_at": timestampField().entityId("FMFID:47245705350"),
    "id": textField().primaryKey().entityId("FMFID:51540672646")
}, {
  entityId: "FMTID:1065094",
  navigationPaths: ["ProjectAssets"]
});
