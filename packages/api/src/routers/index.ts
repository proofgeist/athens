import { protectedProcedure, publicProcedure } from "../index";
import type { RouterClient } from "@orpc/server";
import { projectsRouter } from "./projects";
import { assetsRouter } from "./assets";
import { projectAssetsRouter } from "./projectAssets";
import { smartListRouter } from "./smartList";
import { issuesSummaryRouter } from "./issuesSummary";

export const appRouter = {
  // Health check
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),

  // Protected example
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),

  // RAPTOR routers
  projects: projectsRouter,
  assets: assetsRouter,
  projectAssets: projectAssetsRouter,
  smartList: smartListRouter,
  issuesSummary: issuesSummaryRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
