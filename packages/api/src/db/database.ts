import { FMServerConnection } from "@proofkit/fmodata";

if (!process.env.FM_SERVER) throw new Error("FM_SERVER is not set");
if (!process.env.OTTO_API_KEY) throw new Error("OTTO_API_KEY is not set");
if (!process.env.FM_DATABASE) throw new Error("FM_DATABASE is not set");

// Create a connection to the server
const connection = new FMServerConnection({
  serverUrl: process.env.FM_SERVER,
  auth: {
    apiKey: process.env.OTTO_API_KEY,
  },
});

export const db = connection.database(process.env.FM_DATABASE);


