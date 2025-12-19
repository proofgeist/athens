import { createContext } from "@athens/api/context";
import { appRouter } from "@athens/api/routers/index";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { RPCHandler } from "@orpc/server/fetch";
import { onError } from "@orpc/server";
import { NextRequest } from "next/server";

const rpcHandler = new RPCHandler(appRouter, {
	interceptors: [
		onError((error) => {
			console.error("ORPC error:", error);
			// Log full error details in production for debugging
			if (process.env.NODE_ENV === "production") {
				console.error("Error details:", {
					message: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
					name: error instanceof Error ? error.name : undefined,
				});
			}
		}),
	],
});
const apiHandler = new OpenAPIHandler(appRouter, {
	plugins: [
		new OpenAPIReferencePlugin({
			schemaConverters: [new ZodToJsonSchemaConverter()],
		}),
	],
	interceptors: [
		onError((error) => {
			console.error("OpenAPI error:", error);
			// Log full error details in production for debugging
			if (process.env.NODE_ENV === "production") {
				console.error("Error details:", {
					message: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
					name: error instanceof Error ? error.name : undefined,
				});
			}
		}),
	],
});

async function handleRequest(req: NextRequest) {
	try {
		const rpcResult = await rpcHandler.handle(req, {
			prefix: "/api/rpc",
			context: await createContext(req),
		});
		if (rpcResult.response) return rpcResult.response;

		const apiResult = await apiHandler.handle(req, {
			prefix: "/api/rpc/api-reference",
			context: await createContext(req),
		});
		if (apiResult.response) return apiResult.response;

		return new Response("Not found", { status: 404 });
	} catch (error) {
		console.error("ORPC handler error:", error);
		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : "Internal server error",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
