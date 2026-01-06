import { fmTableOccurrence, numberField, textField } from "@proofkit/fmodata";

export const ProjectAssets = fmTableOccurrence(
  "ProjectAssets",
  {
    project_id: textField().entityId("FMFID:4296032388"),
    asset_id: textField().entityId("FMFID:8590999684"),
    sit_closed: numberField().entityId("FMFID:17180934276"),
    doc_closed: numberField().entityId("FMFID:21475901572"),
    checklist_remaining: numberField().readOnly().entityId("FMFID:25770868868"),
    checklist_closed: numberField().entityId("FMFID:30065836164"),
    checklist_non_conforming: numberField().entityId("FMFID:34360803460"),
    checklist_not_applicable: numberField().entityId("FMFID:38655770756"),
    checklist_deferred: numberField().entityId("FMFID:42950738052"),
    id: textField().primaryKey().entityId("FMFID:47245705348"),
    overall_completion: numberField().readOnly().entityId("FMFID:51540672644"),
    checklist_percent: numberField().readOnly().entityId("FMFID:55835639940"),
    checklist_total: numberField().entityId("FMFID:60130607236"),
    sit_remaining: numberField().readOnly().entityId("FMFID:64425574532"),
    sit_total: numberField().entityId("FMFID:68720541828"),
    sit_percent: numberField().readOnly().entityId("FMFID:73015509124"),
    doc_remaining: numberField().readOnly().entityId("FMFID:77310476420"),
    doc_total: numberField().entityId("FMFID:81605443716"),
    doc_percent: numberField().readOnly().entityId("FMFID:85900411012"),
  },
  {
    entityId: "FMTID:1065092",
    navigationPaths: ["Projects", "Assets"],
  },
);
