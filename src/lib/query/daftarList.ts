import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/fetch/client";
import type { DaftarResponse } from "@/lib/types";

export const daftarList = ({ locationId, schoolId }: { locationId: number; schoolId: number }) =>
	queryOptions({
		queryKey: ["daftarList", locationId, schoolId],
		queryFn: async () =>
			await api.get(`api/daftar/${locationId}/${schoolId}`).json<DaftarResponse>(),
		retry: false,
		staleTime: 1 * 60 * 1000, // 1 minute
	});
