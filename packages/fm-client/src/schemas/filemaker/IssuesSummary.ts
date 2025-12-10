/**
 * Put your custom overrides or transformations here.
 * Changes to this file will NOT be overwritten.
 */
import { z } from "zod/v4";
import { ZIssuesSummary as ZIssuesSummary_generated } from "./generated/IssuesSummary";

export const ZIssuesSummary = ZIssuesSummary_generated;

export type TIssuesSummary = z.infer<typeof ZIssuesSummary>;
