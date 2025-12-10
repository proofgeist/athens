/**
 * Put your custom overrides or transformations here.
 * Changes to this file will NOT be overwritten.
 */
import { z } from "zod/v4";
import { ZSmartList as ZSmartList_generated } from "./generated/SmartList";

export const ZSmartList = ZSmartList_generated;

export type TSmartList = z.infer<typeof ZSmartList>;
