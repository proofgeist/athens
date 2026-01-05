import { fmTableOccurrence, textField, timestampField } from "@proofkit/fmodata";

// ============================================================================
// Table Occurrence: session
// ============================================================================

export const session = fmTableOccurrence("session", {
    "id": textField().primaryKey(),
    "expiresAt": timestampField(),
    "token": textField(),
    "createdAt": timestampField(),
    "updatedAt": timestampField(),
    "ipAddress": textField(),
    "userAgent": textField(),
    "userId": textField()
}, {
  navigationPaths: []
});
