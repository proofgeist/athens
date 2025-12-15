"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { orpc } from "@/utils/orpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

// Define available routers and their procedures
const ROUTERS = {
	projects: {
		list: {
			inputs: ["region", "phase", "risk_level", "status", "limit", "offset"],
			defaults: { limit: 50, offset: 0 },
		},
		getById: {
			inputs: ["id"],
			required: ["id"],
		},
	},
	assets: {
		list: {
			inputs: ["type", "location", "limit", "offset"],
			defaults: { limit: 50, offset: 0 },
		},
		getById: {
			inputs: ["id"],
			required: ["id"],
		},
	},
	projectAssets: {
		list: {
			inputs: ["project_id", "asset_id", "limit", "offset"],
			defaults: { limit: 50, offset: 0 },
		},
		getById: {
			inputs: ["id"],
			required: ["id"],
		},
		getSummaryStats: {
			inputs: [],
		},
	},
	smartList: {
		list: {
			inputs: ["project_asset_id", "priority", "status", "system_group", "milestone_target", "limit", "offset", "includeRelated"],
			defaults: { limit: 50, offset: 0, includeRelated: false },
		},
		getById: {
			inputs: ["id"],
			required: ["id"],
		},
		getStatusSummary: {
			inputs: ["project_asset_id"],
		},
	},
	issuesSummary: {
		getByProjectAsset: {
			inputs: ["project_asset_id"],
			required: ["project_asset_id"],
		},
		getSystemProgress: {
			inputs: ["project_asset_id"],
			required: ["project_asset_id"],
		},
		getActionItemCounts: {
			inputs: ["project_asset_id"],
			required: ["project_asset_id"],
		},
	},
} as const;

type RouterName = keyof typeof ROUTERS;
type ProcedureName<R extends RouterName> = keyof typeof ROUTERS[R];

export function RoutesTester() {
	const [selectedRouter, setSelectedRouter] = useState<RouterName>("projects");
	const [selectedProcedure, setSelectedProcedure] = useState<string>("list");
	const [isExecuting, setIsExecuting] = useState(false);
	const [result, setResult] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);

	const routerConfig = ROUTERS[selectedRouter] as any;
	const procedureConfig = routerConfig?.[selectedProcedure];

	const handleExecute = async (data: Record<string, any>) => {
		setIsExecuting(true);
		setError(null);
		setResult(null);

		try {
			// Build input object, filtering out empty values
			const input: Record<string, any> = {};
			for (const [key, value] of Object.entries(data)) {
				if (value !== "" && value !== undefined && value !== null) {
					// Convert numeric strings to numbers for limit/offset
					if (key === "limit" || key === "offset") {
						input[key] = Number(value);
					} else {
						input[key] = value;
					}
				}
			}

			// Execute the procedure
			const router = orpc[selectedRouter as keyof typeof orpc] as any;
			const procedure = router[selectedProcedure];

			let response;
			if (Object.keys(input).length > 0) {
				response = await procedure({ input });
			} else {
				response = await procedure();
			}

			setResult(response);
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setIsExecuting(false);
		}
	};

	return (
		<div className="grid gap-6 lg:grid-cols-2">
			{/* Input Panel */}
			<Card>
				<CardHeader>
					<CardTitle>Request</CardTitle>
					<CardDescription>Select a router, procedure, and provide input parameters</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Router Selection */}
					<div className="space-y-2">
						<Label>Router</Label>
						<Select
							value={selectedRouter}
							onValueChange={(value) => {
								setSelectedRouter(value as RouterName);
								const firstProcedure = Object.keys(ROUTERS[value as RouterName])[0];
								setSelectedProcedure(firstProcedure || "");
								setResult(null);
								setError(null);
							}}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.keys(ROUTERS).map((router) => (
									<SelectItem key={router} value={router}>
										{router}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Procedure Selection */}
					<div className="space-y-2">
						<Label>Procedure</Label>
						<Select
							value={selectedProcedure}
							onValueChange={(value) => {
								setSelectedProcedure(value);
								setResult(null);
								setError(null);
							}}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.keys(ROUTERS[selectedRouter]).map((proc) => (
									<SelectItem key={proc} value={proc}>
										{proc}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Input Form */}
					{procedureConfig && (
						<ProcedureInputForm
							inputs={procedureConfig.inputs}
							defaults={procedureConfig.defaults}
							required={procedureConfig.required}
							onSubmit={handleExecute}
							isExecuting={isExecuting}
						/>
					)}
				</CardContent>
			</Card>

			{/* Output Panel */}
			<Card>
				<CardHeader>
					<CardTitle>Response</CardTitle>
					<CardDescription>Formatted JSON output from the API</CardDescription>
				</CardHeader>
				<CardContent>
					{error && (
						<div className="rounded-lg bg-destructive/10 p-4 text-destructive">
							<p className="font-semibold">Error</p>
							<pre className="mt-2 text-sm whitespace-pre-wrap">{error}</pre>
						</div>
					)}

					{result && (
						<div className="rounded-lg bg-muted p-4">
							<pre className="text-xs overflow-auto max-h-[600px]">
								{JSON.stringify(result, null, 2)}
							</pre>
						</div>
					)}

					{!result && !error && (
						<div className="text-center text-muted-foreground py-12">
							<p>Execute a procedure to see results</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function ProcedureInputForm({
	inputs,
	defaults = {},
	required = [],
	onSubmit,
	isExecuting,
}: {
	inputs: readonly string[];
	defaults?: Record<string, any>;
	required?: readonly string[];
	onSubmit: (data: Record<string, any>) => Promise<void>;
	isExecuting: boolean;
}) {
	const { register, handleSubmit, setValue, watch } = useForm({
		defaultValues: defaults,
	});

	if (inputs.length === 0) {
		return (
			<div className="pt-4">
				<Button onClick={() => onSubmit({})} disabled={isExecuting} className="w-full">
					{isExecuting ? "Executing..." : "Execute"}
				</Button>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<div className="space-y-3">
				{inputs.map((input) => {
					const isRequired = required.includes(input);
					
					// Special handling for boolean inputs
					if (input === "includeRelated") {
						const checked = watch(input);
						return (
							<div key={input} className="flex items-center space-x-2">
								<Checkbox
									id={input}
									checked={checked}
									onCheckedChange={(checked) => setValue(input, checked)}
								/>
								<Label
									htmlFor={input}
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									{input}
								</Label>
							</div>
						);
					}

			// Special handling for enum inputs
			if (input === "priority") {
				return (
					<div key={input} className="space-y-2">
						<Label>
							{input}
							{isRequired && <span className="text-destructive ml-1">*</span>}
						</Label>
						<Select onValueChange={(value) => setValue(input, value || undefined)}>
							<SelectTrigger>
								<SelectValue placeholder="Select priority (optional)..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="High">High</SelectItem>
								<SelectItem value="Medium">Medium</SelectItem>
								<SelectItem value="Low">Low</SelectItem>
							</SelectContent>
						</Select>
					</div>
				);
			}

			if (input === "status" && inputs.includes("priority")) {
				return (
					<div key={input} className="space-y-2">
						<Label>
							{input}
							{isRequired && <span className="text-destructive ml-1">*</span>}
						</Label>
						<Select onValueChange={(value) => setValue(input, value || undefined)}>
							<SelectTrigger>
								<SelectValue placeholder="Select status (optional)..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Open">Open</SelectItem>
								<SelectItem value="Closed">Closed</SelectItem>
								<SelectItem value="Deferred">Deferred</SelectItem>
							</SelectContent>
						</Select>
					</div>
				);
			}

					// Regular text/number inputs
					return (
						<div key={input} className="space-y-2">
							<Label>
								{input}
								{isRequired && <span className="text-destructive ml-1">*</span>}
							</Label>
							<Input
								{...register(input)}
								type={input === "limit" || input === "offset" ? "number" : "text"}
								placeholder={`Enter ${input}...`}
								required={isRequired}
							/>
						</div>
					);
				})}
			</div>

			<Button type="submit" disabled={isExecuting} className="w-full">
				{isExecuting ? "Executing..." : "Execute"}
			</Button>
		</form>
	);
}

