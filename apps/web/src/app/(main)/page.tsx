import { redirect } from "next/navigation";

export default function HomePage() {
	// Redirect to projects as the main landing page
	redirect("/projects");
}
