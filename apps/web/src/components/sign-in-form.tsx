"use client";

import { authClient } from "@/lib/auth-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import Loader from "./loader";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";

const signInSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInForm({
	onSwitchToSignUp,
}: {
	onSwitchToSignUp: () => void;
}) {
	const router = useRouter();
	const { isPending } = authClient.useSession();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<SignInFormData>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (data: SignInFormData) => {
		await authClient.signIn.email(
			{
				email: data.email,
				password: data.password,
			},
			{
				onSuccess: () => {
					router.push("/");
					toast.success("Sign in successful");
				},
				onError: (error) => {
					toast.error(error.error.message || error.error.statusText);
				},
			},
		);
	};

	if (isPending) {
		return <Loader />;
	}

	return (
		<Card className="w-full max-w-md border-border bg-card shadow-lg transition-all duration-300 hover:shadow-xl">
			<CardHeader className="text-center">
				<CardTitle className="font-sans text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
				<CardDescription>Sign in to your account to continue</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="you@example.com"
							{...register("email")}
							aria-invalid={errors.email ? "true" : "false"}
							className="transition-all duration-200 focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:border-accent"
						/>
						{errors.email && (
							<p className="text-sm text-destructive">{errors.email.message}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							placeholder="••••••••"
							{...register("password")}
							aria-invalid={errors.password ? "true" : "false"}
							className="transition-all duration-200 focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:border-accent"
						/>
						{errors.password && (
							<p className="text-sm text-destructive">
								{errors.password.message}
							</p>
						)}
					</div>

					<Button type="submit" variant="default" className="w-full" disabled={isSubmitting}>
						{isSubmitting ? "Signing in..." : "Sign In"}
					</Button>
				</form>

				<div className="mt-6 text-center">
					<span className="text-sm text-muted-foreground">
						Don't have an account?{" "}
					</span>
					<Button
						variant="link"
						onClick={onSwitchToSignUp}
						className="p-0 h-auto"
					>
						Sign Up
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
