import { createFileRoute } from "@tanstack/react-router";
import { api } from "#/lib/fetch/server";

export const Route = createFileRoute("/api/daftar/$id_sekolah")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const data = await api.get(`daftar/madrasah/ma/1-${params["id_sekolah"]}.json`).json();
				return new Response(JSON.stringify(data), {
					headers: {
						"Content-Type": "application/json",
					},
				});
			},
		},
	},
});
