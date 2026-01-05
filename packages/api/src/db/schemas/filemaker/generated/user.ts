import { fmTableOccurrence, textField, numberField, timestampField } from "@proofkit/fmodata";

// ============================================================================
// Table Occurrence: user
// ============================================================================

export const user = fmTableOccurrence("user", {
    "id": textField().primaryKey(),
    "name": textField(),
    "email": textField(),
    "emailVerified": numberField(),
    "image": textField(),
    "createdAt": timestampField(),
    "updatedAt": timestampField()
}, {
  navigationPaths: []
});
