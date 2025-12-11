import { fmTableOccurrence, textField } from "@proofkit/fmodata";

export const Assets = fmTableOccurrence("Assets", {
  id: textField().primaryKey(),
  name: textField().notNull(),
  type: textField().notNull(),
  location: textField().notNull(),
}, { navigationPaths: ["Projects", "ProjectAssets"] });

