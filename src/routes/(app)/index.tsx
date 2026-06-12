import { SimpleTable } from "@/components/simple-table";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { daftarList } from "@/lib/query/daftarList";
import { dataDaftar } from "@/lib/query/dataDaftar";
import { madrasahList } from "@/lib/query/madrasahList";
import { madrasahStatColumns } from "@/lib/table/madrasah-stats";
import type { MadrasahStat } from "@/lib/table/madrasah-stats";
import type { DetailSection, Madrasah } from "@/lib/types";
import { useQueries, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	Building2Icon,
	MapPinIcon,
	TrophyIcon,
	UsersIcon,
} from "lucide-react";

export const Route = createFileRoute("/(app)/")({
	component: Home,
});

type MeData = {
	nama: string;
	nilai: string;
	asal_sekolah: string;
	no_peserta: string;
};

function extractPosition(sections: DetailSection[]): {
	school: string | null;
	urutan: string | null;
	status: string;
} {
	const pilihan = sections.find((s) => s.id === "pilihan");
	if (!pilihan) return { school: null, urutan: null, status: "" };
	const status = pilihan.children?.at(0)?.children?.at(0)?.header ?? "";
	for (const child of pilihan.children ?? []) {
		const diterima = child.children?.find((c) => c.header === "Sementara Diterima");
		if (diterima) {
			const urutan = diterima.properties.find((p) => p.key === "urutan");
			const school = child.properties.find((p) => p.label === "Pilihan Sekolah");
			return {
				school: school ? String(school.value) : null,
				urutan: urutan ? String(urutan.value) : null,
				status: status,
			};
		}
	}
	return { school: null, urutan: null, status: status };
}

function MePositionContent({
	isLoading,
	mePosition,
	hasData,
}: Readonly<{
	isLoading: boolean;
	mePosition: { school: string | null; urutan: string | null } | null;
	hasData: boolean;
}>) {
	if (isLoading) {
		return (
			<div className="flex flex-col gap-2">
				<Skeleton className="h-5 w-64" />
				<Skeleton className="h-5 w-32" />
			</div>
		);
	}
	if (mePosition?.school) {
		return (
			<div className="flex flex-col gap-1 text-sm">
				<div className="text-muted-foreground flex items-center gap-1.5">
					<MapPinIcon className="size-4 shrink-0" />
					{mePosition.school}
				</div>
				<div className="text-muted-foreground flex items-center gap-1.5">
					<TrophyIcon className="size-4 shrink-0" />
					Posisi{" "}
					<span className="text-foreground font-semibold tabular-nums">{mePosition.urutan}</span>
				</div>
			</div>
		);
	}
	if (hasData) {
		return <p className="text-muted-foreground text-sm">Belum ada hasil seleksi.</p>;
	}
	return null;
}

function MeCard({ me }: Readonly<{ me: MeData }>) {
	const { data: detailData, isLoading } = useQuery({
		...dataDaftar(me.no_peserta),
	});
	const mePosition = detailData ? extractPosition(detailData.data) : null;

	return (
		<Card className="border-primary/30 bg-primary/5">
			<CardHeader>
				<CardDescription className="flex w-full justify-between">
					Data Saya <Badge variant="outline">{mePosition?.status}</Badge>
				</CardDescription>
				<CardTitle className="text-xl">{me.nama}</CardTitle>
			</CardHeader>
			<CardContent className="gap flex flex-col text-sm">
				<span className="text-muted-foreground">
					Nilai: <span className="text-foreground font-medium tabular-nums">{me.nilai}</span>
				</span>
				<span className="text-muted-foreground">
					Asal: <span className="text-foreground font-medium">{me.asal_sekolah}</span>
				</span>
				<span className="text-muted-foreground">
					No. Daftar:{" "}
					<span className="text-foreground font-medium tabular-nums">{me.no_peserta}</span>
				</span>
			</CardContent>
			<CardFooter className="text-right">
				<MePositionContent
					isLoading={isLoading}
					mePosition={mePosition}
					hasData={detailData !== undefined}
				/>
			</CardFooter>
		</Card>
	);
}

type DaftarQuery = { data?: { data: { nilai: string }[] } };

function median(scores: number[]): number | null {
	if (!scores.length) return null;
	const sorted = [...scores].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

type Extreme = { madrasah: Madrasah | null; value: number | null };

function updateMax(current: Extreme, candidate: Madrasah, value: number | null): Extreme {
	if (value !== null && (current.value === null || value > current.value))
		return { madrasah: candidate, value };
	return current;
}

function updateMin(current: Extreme, candidate: Madrasah, value: number | null): Extreme {
	if (value !== null && (current.value === null || value < current.value))
		return { madrasah: candidate, value };
	return current;
}

function computeStats(madrasahData: Madrasah[], daftarQueries: DaftarQuery[]) {
	let most: Extreme = { madrasah: null, value: null };
	let highScore: Extreme = { madrasah: null, value: null };
	let lowScore: Extreme = { madrasah: null, value: null };
	let highMean: Extreme = { madrasah: null, value: null };
	let lowMean: Extreme = { madrasah: null, value: null };
	let highMedian: Extreme = { madrasah: null, value: null };
	let lowMedian: Extreme = { madrasah: null, value: null };
	let totalPendaftar = 0;
	const madrasahStats: MadrasahStat[] = [];
	const allRawScores: number[] = [];

	for (let i = 0; i < madrasahData.length; i++) {
		const m = madrasahData[i];
		const rows = daftarQueries[i]?.data?.data ?? [];
		const scores = rows.map((row) => Number(row.nilai)).filter((n) => !Number.isNaN(n));
		const max = scores.length ? Math.max(...scores) : null;
		const min = scores.length ? Math.min(...scores) : null;
		const mean = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
		const med = median(scores);

		totalPendaftar += rows.length;
		allRawScores.push(...scores);

		if (rows.length > (most.value ?? -1)) most = { madrasah: m, value: rows.length };
		highScore = updateMax(highScore, m, max);
		lowScore = updateMin(lowScore, m, min);
		highMean = updateMax(highMean, m, mean);
		lowMean = updateMin(lowMean, m, mean);
		highMedian = updateMax(highMedian, m, med);
		lowMedian = updateMin(lowMedian, m, med);

		madrasahStats.push({
			nama: m.nama,
			jumlah: rows.length,
			mean,
			median: med,
			highest: max,
			lowest: min,
		});
	}

	const overallMean = allRawScores.length
		? allRawScores.reduce((a, b) => a + b, 0) / allRawScores.length
		: null;

	return {
		highestScore: highScore.value,
		highestMadrasah: highScore.madrasah,
		lowestScore: lowScore.value,
		lowestMadrasah: lowScore.madrasah,
		mostMadrasah: most.madrasah,
		mostCount: most.value ?? 0,
		totalPendaftar,
		madrasahStats,
		overallMean,
		overallMedian: median(allRawScores),
		highestMeanMadrasah: highMean.madrasah,
		highestMeanValue: highMean.value,
		lowestMeanMadrasah: lowMean.madrasah,
		lowestMeanValue: lowMean.value,
		highestMedianMadrasah: highMedian.madrasah,
		highestMedianValue: highMedian.value,
		lowestMedianMadrasah: lowMedian.madrasah,
		lowestMedianValue: lowMedian.value,
	};
}

function Home() {
	const { data } = useSuspenseQuery(madrasahList);
	const madrasahData = data as Madrasah[];

	const [me, setMe] = useState<MeData | null>(null);

	useEffect(() => {
		const stored = localStorage.getItem("me");
		if (stored) {
			try {
				setMe(JSON.parse(stored));
			} catch {
				// ignore malformed data
			}
		}
	}, []);

	const daftarQueries = useQueries({
		queries: madrasahData.map((item) =>
			daftarList({ locationId: item.lokasi_id, schoolId: item.sekolah_id }),
		),
	});

	const isLoading = daftarQueries.some((q) => q.isLoading);

	const {
		highestScore,
		highestMadrasah,
		lowestScore,
		lowestMadrasah,
		mostMadrasah,
		mostCount,
		totalPendaftar,
		madrasahStats,
		overallMean,
		overallMedian,
		highestMeanMadrasah,
		highestMeanValue,
		lowestMeanMadrasah,
		lowestMeanValue,
		highestMedianMadrasah,
		highestMedianValue,
		lowestMedianMadrasah,
		lowestMedianValue,
	} = computeStats(madrasahData, daftarQueries);

	return (
		<main className="flex flex-col gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
				<p className="text-muted-foreground mt-1 text-sm">
					Pantau statistik SPMB Madrasah secara real-time.
				</p>
			</div>

			{me && <MeCard me={me} />}

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader>
						<CardDescription className="flex items-center gap-1.5">
							<Building2Icon className="size-4" />
							Jumlah Madrasah
						</CardDescription>
						<CardTitle className="text-2xl tabular-nums">
							{madrasahData.length.toLocaleString()}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader>
						<CardDescription className="flex items-center gap-1.5">
							<UsersIcon className="size-4" />
							Jumlah Pendaftar
						</CardDescription>
						<CardTitle className="text-2xl tabular-nums">
							{isLoading ? <Skeleton className="h-8 w-20" /> : totalPendaftar.toLocaleString()}
						</CardTitle>
					</CardHeader>
					{!isLoading && mostMadrasah && (
						<CardContent>
							<p className="text-muted-foreground text-xs">Terbanyak</p>
							<p className="truncate text-xs font-medium">
								{mostMadrasah.nama} · {mostCount.toLocaleString()}
							</p>
						</CardContent>
					)}
				</Card>
				<Card>
					<CardHeader>
						<CardDescription>
							<ArrowUpIcon className="size-4" />
							Nilai Tertinggi
						</CardDescription>
						<CardTitle className="text-2xl text-green-600 tabular-nums">
							{isLoading ? (
								<Skeleton className="h-8 w-24" />
							) : (
								(highestScore?.toLocaleString() ?? "—")
							)}
						</CardTitle>
					</CardHeader>
					{!isLoading && highestMadrasah && (
						<CardContent>
							<p className="text-muted-foreground text-xs">Tertinggi di</p>
							<p className="truncate text-xs font-medium">{highestMadrasah.nama}</p>
						</CardContent>
					)}
				</Card>
				<Card>
					<CardHeader>
						<CardDescription className="flex items-center gap-1.5 text-red-600">
							<ArrowDownIcon className="size-4" />
							Nilai Terendah
						</CardDescription>
						<CardTitle className="text-2xl text-red-600 tabular-nums">
							{isLoading ? (
								<Skeleton className="h-8 w-24" />
							) : (
								(lowestScore?.toLocaleString() ?? "—")
							)}
						</CardTitle>
					</CardHeader>
					{!isLoading && lowestMadrasah && (
						<CardContent>
							<p className="text-muted-foreground text-xs">Terendah di</p>
							<p className="truncate text-xs font-medium">{lowestMadrasah.nama}</p>
						</CardContent>
					)}
				</Card>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Statistik Keseluruhan</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col gap-2">
						{isLoading ? (
							<>
								<Skeleton className="h-5 w-40" />
								<Skeleton className="h-5 w-40" />
							</>
						) : (
							<>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Rata-rata</span>
									<span className="font-medium tabular-nums">
										{overallMean?.toLocaleString() ?? "—"}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Median</span>
									<span className="font-medium tabular-nums">
										{overallMedian?.toLocaleString() ?? "—"}
									</span>
								</div>
							</>
						)}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Rata-rata & Median per Madrasah</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col gap-4">
						{isLoading ? (
							<>
								<Skeleton className="h-16 w-full" />
								<Skeleton className="h-16 w-full" />
								<Skeleton className="h-16 w-full" />
								<Skeleton className="h-16 w-full" />
							</>
						) : (
							<>
								<div>
									<p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
										Rata-rata
									</p>
									<div className="flex flex-col gap-2">
										{[
											{
												label: "Tertinggi",
												madrasah: highestMeanMadrasah,
												value: highestMeanValue,
											},
											{ label: "Terendah", madrasah: lowestMeanMadrasah, value: lowestMeanValue },
										].map(({ label, madrasah, value }) => (
											<div key={label} className="flex items-end justify-between gap-4 text-sm">
												<div className="min-w-0">
													<p className="text-muted-foreground">{label}</p>
													<p className="truncate font-medium">{madrasah?.nama ?? "—"}</p>
												</div>
												<span className="shrink-0 font-medium tabular-nums">
													{value?.toLocaleString() ?? "—"}
												</span>
											</div>
										))}
									</div>
								</div>
								<div className="border-t pt-4">
									<p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
										Median
									</p>
									<div className="flex flex-col gap-2">
										{[
											{
												label: "Tertinggi",
												madrasah: highestMedianMadrasah,
												value: highestMedianValue,
											},
											{
												label: "Terendah",
												madrasah: lowestMedianMadrasah,
												value: lowestMedianValue,
											},
										].map(({ label, madrasah, value }) => (
											<div key={label} className="flex items-end justify-between gap-4 text-sm">
												<div className="min-w-0">
													<p className="text-muted-foreground">{label}</p>
													<p className="truncate font-medium">{madrasah?.nama ?? "—"}</p>
												</div>
												<span className="shrink-0 font-medium tabular-nums">
													{value?.toLocaleString() ?? "—"}
												</span>
											</div>
										))}
									</div>
								</div>
							</>
						)}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Statistik per Madrasah</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<Skeleton className="h-48 w-full" />
					) : (
						<SimpleTable columns={madrasahStatColumns} data={madrasahStats} />
					)}
				</CardContent>
			</Card>
		</main>
	);
}
