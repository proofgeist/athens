import { fmTableOccurrence, textField, numberField, dateField } from "@proofkit/fmodata";

export const IssuesSummary = fmTableOccurrence("IssuesSummary", {
  id: textField().primaryKey(),
  project_asset_id: textField().notNull(),
  summary_date: dateField().notNull(),
  total_items: numberField(),
  open_high: numberField(),
  closed_high: numberField(),
  open_medium: numberField(),
  closed_medium: numberField(),
  open_low: numberField(),
  closed_low: numberField(),
  system_group: textField(),
  system_progress: numberField(),
});

