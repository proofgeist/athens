import { nextCookies } from 'better-auth/next-js';
import { betterAuth } from "better-auth";
import { FileMakerAdapter } from "@proofkit/better-auth";

export const auth = betterAuth({
  database: FileMakerAdapter({
    odata: {
      serverUrl: process.env.FM_SERVER,
      auth: {
        apiKey: process.env.OTTO_API_KEY,
      },
      database: process.env.FM_DATABASE,
    },
  }),
  plugins: [nextCookies()],
});