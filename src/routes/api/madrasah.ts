import { createFileRoute } from "@tanstack/react-router";
import { api } from "#/lib/fetch/server";

export const Route = createFileRoute("/api/madrasah")({
	server: {
		handlers: {
			GET: async () => {
				const data = await api.get("sekolah/lokasi/1-ma-madrasah.json").json();
				return new Response(JSON.stringify(data), {
					headers: {
						"Content-Type": "application/json",
					},
				});
			},
		},
	},
});
