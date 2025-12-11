import { QueryClient } from "@tanstack/react-query";

// Server-side query client factory
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
      },
    },
  });
}

