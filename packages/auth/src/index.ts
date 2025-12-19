import { nextCookies } from 'better-auth/next-js';
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
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
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    nextCookies(),
    organization({
      schema: {
        organization: {
          modelName: "customer", // Override with your FileMaker table name
        },
        member: {
          modelName: "organizationMember", // Override with your FileMaker table name
        },
      },
    }),
  ],
});