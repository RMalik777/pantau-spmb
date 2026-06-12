import { createFileRoute } from "@tanstack/react-router";
import { api } from "#/lib/fetch/server";

export const Route = createFileRoute("/api/daftar/$id_lokasi/$id_sekolah")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const [daftarResult, seleksiResult] = await Promise.allSettled([
					api.get(`daftar/madrasah/ma/1-${params["id_lokasi"]}.json`).json<{
						sekolah: Record<string, unknown>;
						data: [number, string, string, string, string, string][];
						rekap: unknown[];
						rows_per_page: number;
						signature: string;
					}>(),
					api.get(`seleksi/madrasah/ma/1-${params["id_sekolah"]}-0.json`).json<{
						sekolah: Record<string, unknown>;
						kompetensi: string;
						enable: boolean;
						jml_pagu: number;
						jml_luar: number | null;
						data: [number, string, string, string, string, string][];
					}>(),
				]);

				if (seleksiResult.status === "rejected") {
					return new Response(
						JSON.stringify({
							error: "Gagal mengambil data seleksi",
							detail: String(seleksiResult.reason),
						}),
						{ status: 503, headers: { "Content-Type": "application/json" } },
					);
				}

				const seleksi = seleksiResult.value;
				const daftar = daftarResult.status === "fulfilled" ? daftarResult.value : null;

				const asalSekolahMap = daftar
					? new Map(daftar.data.map(([, , nisn, , asalSekolah]) => [nisn, asalSekolah]))
					: new Map<string, string>();

				const combined = {
					sekolah: {
						...seleksi.sekolah,
						...(daftar ? { lokasi_id: daftar.sekolah.lokasi_id } : {}),
					},
					kompetensi: seleksi.kompetensi,
					enable: seleksi.enable,
					jml_pagu: seleksi.jml_pagu,
					jml_luar: seleksi.jml_luar,
					data: seleksi.data.map(([rank, noPeserta, nama, nilai, umur, timestamp]) => ({
						rank,
						no_peserta: noPeserta,
						nama,
						nilai,
						umur,
						timestamp,
						asal_sekolah: asalSekolahMap.get(noPeserta) ?? null,
					})),
					rekap: daftar?.rekap ?? [],
					rows_per_page: daftar?.rows_per_page ?? seleksi.data.length,
					signature: daftar?.signature ?? "",
				};

				return new Response(JSON.stringify(combined), {
					headers: { "Content-Type": "application/json" },
				});
			},
		},
	},
});
