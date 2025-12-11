import { fmTableOccurrence, textField, dateField } from "@proofkit/fmodata";

export const SmartList = fmTableOccurrence("SmartList", {
  id: textField().primaryKey(),
  project_asset_id: textField().notNull(),
  title: textField().notNull(),
  description: textField(),
  priority: textField().notNull(), // High, Medium, Low
  status: textField().notNull(), // Open, Closed, Deferred
  due_date: dateField(),
  milestone_target: textField(),
  system_group: textField(),
  assigned_to: textField(),
  created_at: textField().readOnly(),
  updated_at: textField().readOnly(),
}, { navigationPaths: ["ProjectAssets"] });

