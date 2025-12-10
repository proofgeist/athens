/**
 * Put your custom overrides or transformations here.
 * Changes to this file will NOT be overwritten.
 */
import { z } from "zod/v4";
import { ZAssets as ZAssets_generated } from "./generated/Assets";

export const ZAssets = ZAssets_generated;

export type TAssets = z.infer<typeof ZAssets>;
