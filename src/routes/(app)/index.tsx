import { daftarList } from "@/lib/query/daftarList";
import { madrasahList } from "@/lib/query/madrasahList";
import { columns } from "@/lib/table/daftar";
import type { Madrasah } from "@/lib/types";
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownIcon, ArrowUpIcon, RefreshCwIcon } from "lucide-react";
import { DataTable } from "@/components/data-table";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/(app)/")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(madrasahList);
	},
	component: Home,
});

function useIsVisible() {
	const ref = useRef<HTMLDivElement>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				setIsVisible(true);
				observer.disconnect();
			}
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return { ref, isVisible };
}

function MadrasahCard({ item }: Readonly<{ item: Madrasah }>) {
	const { ref, isVisible } = useIsVisible();
	const queryClient = useQueryClient();
	const {
		data: daftar,
		isLoading,
		isFetching,
	} = useQuery({ ...daftarList(item.lokasi_id), enabled: isVisible });

	function handleRefresh() {
		queryClient.invalidateQueries({
			queryKey: daftarList(item.lokasi_id).queryKey,
		});
	}

	return (
		<div ref={ref}>
			<Card>
				<CardHeader>
					<CardTitle>{item.nama}</CardTitle>
					<CardDescription>
						NPSN: {item.npsn} · {item.kota}, {item.propinsi}
					</CardDescription>
					<CardAction>
						<Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isFetching}>
							<RefreshCwIcon data-icon className={isFetching ? "animate-spin" : ""} />
						</Button>
					</CardAction>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					{isLoading && (
						<div className="flex flex-col gap-4">
							<div className="flex gap-4">
								<Skeleton className="h-20 flex-1 rounded-lg" />
								<Skeleton className="h-20 flex-1 rounded-lg" />
							</div>
							<Skeleton className="h-64 w-full rounded-lg" />
						</div>
					)}
					{daftar &&
						(() => {
							const scores = daftar.data
								.map((row) => Number(row[5]))
								.filter((n) => !Number.isNaN(n));
							const highest = scores.length ? Math.max(...scores) : null;
							const lowest = scores.length ? Math.min(...scores) : null;
							return (
								<>
									<div className="flex flex-col justify-stretch gap-4 *:grow sm:flex-row">
										<Card>
											<CardHeader>
												<CardDescription className="flex items-center gap-1 text-green-600">
													<ArrowUpIcon />
													Nilai Tertinggi
												</CardDescription>
												<CardTitle className="text-2xl font-semibold text-green-600 tabular-nums">
													{highest?.toFixed(2) ?? "—"}
												</CardTitle>
											</CardHeader>
										</Card>
										<Card>
											<CardHeader>
												<CardDescription className="flex items-center gap-1 text-red-600">
													<ArrowDownIcon />
													Nilai Terendah
												</CardDescription>
												<CardTitle className="text-2xl font-semibold text-red-600 tabular-nums">
													{lowest?.toFixed(2) ?? "—"}
												</CardTitle>
											</CardHeader>
										</Card>
									</div>
									<DataTable
										columns={columns}
										data={daftar.data}
										filterColumn="nama"
										filterPlaceholder="Cari nama..."
										initialColumnVisibility={{ no_pendaftaran: false }}
									/>
								</>
							);
						})()}
				</CardContent>
			</Card>
		</div>
	);
}

function Home() {
	const { data } = useSuspenseQuery(madrasahList);
	const [search, setSearch] = useState("");

	const filtered = (data as Madrasah[]).filter((item) =>
		item.nama.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<main className="flex flex-col gap-4 px-6 py-4">
			<h1>Pantau SPMB</h1>
			<Input
				placeholder="Cari madrasah..."
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				className="max-w-sm"
			/>
			<div className="flex flex-col gap-4">
				{filtered.map((item) => (
					<MadrasahCard key={item.lokasi_id} item={item} />
				))}
			</div>
		</main>
	);
}
