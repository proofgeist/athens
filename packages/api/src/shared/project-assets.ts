import { z } from "zod";

/**
 * Shared types and schemas for ProjectAssets
 * Used across API and frontend to ensure type consistency
 */

export const ProjectAssetSortBySchema = z.enum([
  "projectName",
  "assetName",
  "raptor",
  "sit",
  "doc",
  "remaining",
]);

export type ProjectAssetSortBy = z.infer<typeof ProjectAssetSortBySchema>;

export const SortOrderSchema = z.enum(["asc", "desc"]);

export type SortOrder = z.infer<typeof SortOrderSchema>;

