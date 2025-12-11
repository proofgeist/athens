import { fmTableOccurrence, textField, numberField, timestampField } from "@proofkit/fmodata";

// ============================================================================
// Table Occurrence: Projects
// ============================================================================

export const Projects = fmTableOccurrence("Projects", {
    "name": textField().entityId("FMFID:4296032386"),
    "region": textField().entityId("FMFID:8590999682"),
    "phase": textField().entityId("FMFID:12885966978"),
    "risk_level": textField().entityId("FMFID:17180934274"),
    "overall_completion": numberField().entityId("FMFID:21475901570"),
    "readiness_score": numberField().entityId("FMFID:25770868866"),
    "status": textField().entityId("FMFID:30065836162"),
    "created_at": timestampField().entityId("FMFID:34360803458"),
    "updated_at": timestampField().entityId("FMFID:38655770754"),
    "id": textField().primaryKey().entityId("FMFID:42950738050")
}, {
  entityId: "FMTID:1065090",
  navigationPaths: ["ProjectAssets"]
});
