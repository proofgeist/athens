import { FMServerConnection } from "@proofkit/fmodata";


if (!process.env.FM_SERVER) {
	const error = new Error(
		"FM_SERVER environment variable is not set. Please configure it in your deployment environment (e.g., Vercel Environment Variables)."
	);
	console.error("[database.ts] Initialization error:", error.message);
	throw error;
}
if (!process.env.OTTO_API_KEY) {
	const error = new Error(
		"OTTO_API_KEY environment variable is not set. Please configure it in your deployment environment (e.g., Vercel Environment Variables)."
	);
	console.error("[database.ts] Initialization error:", error.message);
	throw error;
}
if (!process.env.FM_DATABASE) {
	const error = new Error(
		"FM_DATABASE environment variable is not set. Please configure it in your deployment environment (e.g., Vercel Environment Variables)."
	);
	console.error("[database.ts] Initialization error:", error.message);
	throw error;
}

// Create a connection to the server
const connection = new FMServerConnection({
  serverUrl: process.env.FM_SERVER,
  auth: {
    apiKey: process.env.OTTO_API_KEY,
  },
});

export const db = connection.database(process.env.FM_DATABASE);


