import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/fetch/client";

export const madrasahList = queryOptions({
	queryKey: ["madrasahList"],
	queryFn: async () => await api.get("api/madrasah").json(),
	staleTime: Infinity,
	retry: false,
});
