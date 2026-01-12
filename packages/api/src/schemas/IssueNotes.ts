import { fmTableOccurrence, textField, timestampField } from "@proofkit/fmodata";

// ============================================================================
// Table Occurrence: IssueNotes
// ============================================================================

export const IssueNotes = fmTableOccurrence("IssueNotes", {
  "id": textField().primaryKey().readOnly(),
  "issue_id": textField(),
  "note": textField(),
  "creation_timestamp": timestampField(),
  "created_by": textField(),
}, {
  navigationPaths: ["Issues"]
});
