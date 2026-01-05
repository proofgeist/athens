import { fmTableOccurrence, textField, timestampField } from "@proofkit/fmodata";

// ============================================================================
// Table Occurrence: account
// ============================================================================

export const account = fmTableOccurrence("account", {
    "id": textField().primaryKey(),
    "accountId": textField(),
    "providerId": textField(),
    "userId": textField(),
    "accessToken": textField(),
    "refreshToken": textField(),
    "idToken": textField(),
    "accessTokenExpiresAt": timestampField(),
    "refreshTokenExpiresAt": timestampField(),
    "scope": textField(),
    "password": textField(),
    "createdAt": timestampField(),
    "updatedAt": timestampField()
}, {
  navigationPaths: []
});
