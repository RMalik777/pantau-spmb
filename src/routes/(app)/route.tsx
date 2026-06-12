import { Outlet, createFileRoute } from "@tanstack/react-router";
import { madrasahList } from "@/lib/query/madrasahList";
import { Navbar } from "@/components/navbar";

export const Route = createFileRoute("/(app)")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(madrasahList);
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<Navbar />
			<div className="px-4 py-6 pb-8 sm:px-8 lg:px-16">
				<Outlet />
			</div>
		</>
	);
}
