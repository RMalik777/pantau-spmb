import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/fetch/client";
import type { DetailResponse } from "@/lib/types";

export const dataDaftar = (noDaftar: string) =>
	queryOptions({
		queryKey: ["dataDaftar", noDaftar],
		queryFn: async () => await api.get(`api/cari?no_daftar=${noDaftar}`).json<DetailResponse>(),
		retry: false,
		staleTime: 1 * 60 * 1000, // 1 minute
	});
