import { daftarList } from "@/lib/query/daftarList";
import { madrasahList } from "@/lib/query/madrasahList";
import { columns } from "@/lib/table/daftar";
import type { Madrasah } from "@/lib/types";
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
	SelectLabel,
} from "@/components/ui/select";
import { ArrowDownIcon, ArrowUpIcon, RefreshCwIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/data-table";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/(app)/list")({
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

function MadrasahCard({ item, nameSearch }: Readonly<{ item: Madrasah; nameSearch: string }>) {
	const { ref, isVisible } = useIsVisible();
	const queryClient = useQueryClient();
	const forceLoad = nameSearch.length > 0;
	const {
		data: daftar,
		isLoading,
		isFetching,
	} = useQuery({ ...daftarList(item.lokasi_id), enabled: isVisible || forceLoad });

	function handleRefresh() {
		queryClient.invalidateQueries({
			queryKey: daftarList(item.lokasi_id).queryKey,
		});
	}

	let rows = daftar ? daftar.data : null;
	if (rows && forceLoad) {
		rows = rows.filter((row) => row[3].toLowerCase().includes(nameSearch.toLowerCase()));
	}

	if (forceLoad && daftar && rows!.length === 0) return null;

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
					{rows &&
						(() => {
							const scores = rows.map((row) => Number(row[5])).filter((n) => !Number.isNaN(n));
							const highest = scores.length ? Math.max(...scores) : null;
							const lowest = scores.length ? Math.min(...scores) : null;
							return (
								<>
									{!forceLoad && (
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
									)}
									<DataTable
										columns={columns}
										data={rows}
										filterColumn={forceLoad ? undefined : "nama"}
										filterPlaceholder="Cari nama..."
										initialColumnVisibility={{ no_pendaftaran: false, id: false }}
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
	const madrasahData = data as Madrasah[];
	const mappedMadrasahData = madrasahData.map((item) => ({
		label: item.nama,
		value: String(item.lokasi_id),
	}));
	const [selected, setSelected] = useState<string | null>(null);
	const [nameSearch, setNameSearch] = useState("");

	const filtered = selected
		? madrasahData.filter((item) => String(item.lokasi_id) === selected)
		: madrasahData;

	return (
		<main className="flex flex-col gap-4">
			<h1>Pantau SPMB</h1>
			<div className="flex flex-col gap-2 sm:flex-row">
				<div className="relative flex-1">
					<SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
					<Input
						placeholder="Cari nama peserta..."
						value={nameSearch}
						onChange={(e) => setNameSearch(e.target.value)}
						className="pl-9"
					/>
				</div>
				<Select
					items={mappedMadrasahData}
					value={selected}
					onValueChange={(value) => setSelected(value)}
				>
					<SelectTrigger className="w-full sm:max-w-sm">
						<SelectValue placeholder="Semua madrasah" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Semua Madrasah</SelectLabel>
							<SelectItem value={null}>Tampilkan semua madrasah</SelectItem>
						</SelectGroup>
						<SelectGroup>
							<SelectLabel>Madrasah</SelectLabel>
							{madrasahData.map((item) => (
								<SelectItem key={item.lokasi_id} value={String(item.lokasi_id)}>
									{item.nama}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
			<div className="flex flex-col gap-4">
				{filtered.map((item) => (
					<MadrasahCard key={item.lokasi_id} item={item} nameSearch={nameSearch} />
				))}
			</div>
		</main>
	);
}
