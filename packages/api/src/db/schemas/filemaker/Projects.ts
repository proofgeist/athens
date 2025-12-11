import { fmTableOccurrence, textField, numberField } from "@proofkit/fmodata";

export const Projects = fmTableOccurrence("Projects", {
  id: textField().primaryKey(),
  name: textField().notNull(),
  region: textField().notNull(),
  phase: textField().notNull(),
  risk_level: textField().notNull(),
  overall_completion: numberField(),
  readiness_score: numberField(),
  status: textField().notNull(),
  created_at: textField().readOnly(),
  updated_at: textField().readOnly(),
}, { navigationPaths: ["ProjectAssets", "Assets"] });

