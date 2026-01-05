import { fmTableOccurrence, textField, timestampField } from "@proofkit/fmodata";

// ============================================================================
// Table Occurrence: verification
// ============================================================================

export const verification = fmTableOccurrence("verification", {
    "id": textField().primaryKey(),
    "identifier": textField(),
    "value": textField(),
    "expiresAt": timestampField(),
    "createdAt": timestampField(),
    "updatedAt": timestampField()
}, {
  navigationPaths: []
});
