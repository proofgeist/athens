import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { headers } from "next/headers";
import type { AppRouterClient } from "@athens/api/routers/index";

// Server-side link that forwards headers for auth
export async function createServerLink() {
  const headersList = await headers();
  
  return new RPCLink({
    url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/api/rpc`,
    headers: Object.fromEntries(headersList),
  });
}

// Create server-side oRPC client
export async function createServerOrpc() {
  const link = await createServerLink();
  const client: AppRouterClient = createORPCClient(link);
  return createTanstackQueryUtils(client);
}

