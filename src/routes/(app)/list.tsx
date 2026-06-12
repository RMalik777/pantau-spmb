import { useQueries, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	RefreshCwIcon,
	SearchIcon,
	UsersRoundIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { DataTable } from "@/components/data-table";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { daftarList } from "@/lib/query/daftarList";
import { madrasahList } from "@/lib/query/madrasahList";
import { columns } from "@/lib/table/daftar";
import type { Madrasah } from "@/lib/types";

export const Route = createFileRoute("/(app)/list")({
	component: Home,
});

function MadrasahCard({ item, nameSearch }: Readonly<{ item: Madrasah; nameSearch: string }>) {
	const queryClient = useQueryClient();
	const forceLoad = nameSearch.length > 0;
	const {
		data: daftar,
		isLoading,
		isFetching,
	} = useQuery({
		...daftarList({ locationId: item.lokasi_id, schoolId: item.sekolah_id }),
		enabled: true,
	});

	function handleRefresh() {
		queryClient.invalidateQueries({
			queryKey: daftarList({ locationId: item.lokasi_id, schoolId: item.sekolah_id }).queryKey,
		});
	}

	let rows = daftar ? daftar.data : null;
	if (rows && forceLoad) {
		rows = rows.filter((row) => row.nama.toLowerCase().includes(nameSearch.toLowerCase()));
	}

	if (forceLoad && daftar && rows!.length === 0) return null;

	return (
		<div>
			<Card>
				<CardHeader>
					<CardTitle className="text-lg font-semibold">{item.nama}</CardTitle>
					<CardDescription>
						NPSN: {item.npsn} · {item.kota}, {item.propinsi}
					</CardDescription>
					<CardAction className="flex flex-row items-center gap-2">
						<Link
							to="/detail/$lokasi_id"
							params={{ lokasi_id: item.lokasi_id.toLocaleString() }}
							className={buttonVariants({
								variant: "outline",
								size: "sm",
								className: "border-border!",
							})}
						>
							Detail
						</Link>
						<Button variant="outline" size="sm" onClick={handleRefresh} disabled={isFetching}>
							<RefreshCwIcon data-icon className={isFetching ? "animate-spin" : ""} />
							Refresh
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
							const scores = rows.map((row) => Number(row.nilai)).filter((n) => !Number.isNaN(n));
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
											<Card>
												<CardHeader>
													<CardDescription className="flex items-center gap-1">
														<UsersRoundIcon />
														Jumlah Peserta
													</CardDescription>
													<CardTitle className="text-2xl font-semibold tabular-nums">
														{daftar!.data.length}
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
										initialColumnVisibility={{ no_peserta: false }}
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
	const [nameInput, setNameInput] = useState("");
	const [nameSearch, setNameSearch] = useState("");

	useEffect(() => {
		const id = setTimeout(() => setNameSearch(nameInput), 300);
		return () => clearTimeout(id);
	}, [nameInput]);

	const byMadrasah = selected
		? madrasahData.filter((item) => String(item.lokasi_id) === selected)
		: madrasahData;

	const daftarResults = useQueries({
		queries: byMadrasah.map((item) =>
			daftarList({ locationId: item.lokasi_id, schoolId: item.sekolah_id }),
		),
	});

	const filtered = nameSearch
		? byMadrasah.flatMap((item, i) => {
				const daftar = daftarResults[i]?.data;
				if (!daftar) return [];
				const matches = daftar.data.some((row) =>
					row.nama.toLowerCase().includes(nameSearch.toLowerCase()),
				);
				return matches ? [{ item, isLoading: false }] : [];
			})
		: byMadrasah.map((item, i) => ({ item, isLoading: daftarResults[i]?.isLoading ?? true }));

	const listRef = useRef<HTMLDivElement>(null);

	const virtualizer = useWindowVirtualizer({
		count: filtered.length,
		estimateSize: () => 600,
		overscan: 20,
		scrollMargin: listRef.current?.offsetTop ?? 0,
	});

	const items = virtualizer.getVirtualItems();

	return (
		<main className="flex flex-col gap-4">
			<h1 className="text-xl font-medium">List Sekolah</h1>
			<div className="flex flex-col gap-2 sm:flex-row">
				<div className="relative flex-1">
					<SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
					<Input
						placeholder="Cari nama peserta..."
						value={nameInput}
						onChange={(e) => setNameInput(e.target.value)}
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
					<SelectContent className="max-h-4/5">
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
			<div ref={listRef} style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "100%",
						willChange: "transform",
						transform: `translateY(${(items[0]?.start ?? 0) - virtualizer.options.scrollMargin}px)`,
					}}
				>
					{items.map((virtualItem) => {
						const { item, isLoading } = filtered[virtualItem.index];
						return (
							<div
								key={virtualItem.key}
								data-index={virtualItem.index}
								ref={virtualizer.measureElement}
								className="pb-4"
							>
								{isLoading ? (
									<Card>
										<CardHeader>
											<Skeleton className="h-5 w-48 rounded" />
											<Skeleton className="h-4 w-64 rounded" />
										</CardHeader>
										<CardContent className="flex flex-col gap-4">
											<div className="flex gap-4">
												<Skeleton className="h-20 flex-1 rounded-lg" />
												<Skeleton className="h-20 flex-1 rounded-lg" />
											</div>
											<Skeleton className="h-64 w-full rounded-lg" />
										</CardContent>
									</Card>
								) : (
									<MadrasahCard item={item} nameSearch={nameSearch} />
								)}
							</div>
						);
					})}
				</div>
			</div>
		</main>
	);
}
