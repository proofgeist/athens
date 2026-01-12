import { publicProcedure } from "../index";
import type { RouterClient } from "@orpc/server";
import { projectsRouter } from "./projects";
import { assetsRouter } from "./assets";
import { projectAssetsRouter } from "./projectAssets";
import { issuesRouter } from "./issues";
import { issueNotesRouter } from "./issueNotes";

export const appRouter = {
  // Health check
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),

  // RAPTOR routers
  projects: projectsRouter,
  assets: assetsRouter,
  projectAssets: projectAssetsRouter,
  issues: issuesRouter,
  issueNotes: issueNotesRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
