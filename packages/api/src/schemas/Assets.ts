import { fmTableOccurrence, textField } from "@proofkit/fmodata";

export const Assets = fmTableOccurrence(
  "Assets",
  {
    name: textField().entityId("FMFID:4296032387"),
    type: textField().entityId("FMFID:8590999683"),
    location: textField().entityId("FMFID:12885966979"),
    id: textField().primaryKey().entityId("FMFID:17180934275"),
  },
  {
    entityId: "FMTID:1065091",
    navigationPaths: ["ProjectAssets"],
  },
);
