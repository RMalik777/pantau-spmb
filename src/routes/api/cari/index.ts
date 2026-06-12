import { createFileRoute } from "@tanstack/react-router";
import { api } from "#/lib/fetch/api";

export const Route = createFileRoute("/api/cari/")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const searchParams = new URL(request.url).searchParams;
				const query = searchParams.get("no_daftar");
				const urlSearchParams = new URLSearchParams();
				if (query) {
					urlSearchParams.append("no_daftar", query);
				}
				const data = await api.get(`cari?${urlSearchParams.toString()}`).json();
				return new Response(JSON.stringify(data), {
					headers: {
						"Content-Type": "application/json",
					},
				});
			},
		},
	},
});
