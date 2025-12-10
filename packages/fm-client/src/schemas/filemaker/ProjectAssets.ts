/**
 * Put your custom overrides or transformations here.
 * Changes to this file will NOT be overwritten.
 */
import { z } from "zod/v4";
import { ZProjectAssets as ZProjectAssets_generated } from "./generated/ProjectAssets";

export const ZProjectAssets = ZProjectAssets_generated;

export type TProjectAssets = z.infer<typeof ZProjectAssets>;
