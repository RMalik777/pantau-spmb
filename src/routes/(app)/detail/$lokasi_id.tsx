import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/detail/$lokasi_id")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main>
			<h1>Detail Madrasah</h1>
		</main>
	);
}
