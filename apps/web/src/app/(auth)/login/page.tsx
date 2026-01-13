"use client";

import SignInForm from "@/components/sign-in-form";
// TEMPORARY: Sign-up disabled - uncomment to re-enable
// import SignUpForm from "@/components/sign-up-form";
// import { useState } from "react";

export default function LoginPage() {
	// TEMPORARY: Sign-up disabled - uncomment to re-enable
	// const [showSignIn, setShowSignIn] = useState(true);

	// TEMPORARY: Only show sign-in form
	return <SignInForm />;

	// TEMPORARY: Uncomment to re-enable sign-up switching
	// return showSignIn ? (
	// 	<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
	// ) : (
	// 	<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
	// );
}
