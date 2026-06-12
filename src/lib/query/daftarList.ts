import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/fetch/client";
import type { DaftarResponse } from "@/lib/types";

export const daftarList = (lokasiId: number) =>
	queryOptions({
		queryKey: ["daftarList", lokasiId],
		queryFn: async () => await api.get(`api/daftar/${lokasiId}`).json<DaftarResponse>(),
		retry: false,
	});
