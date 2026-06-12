import { daftarList } from "@/lib/query/daftarList";
import { dataDaftar } from "@/lib/query/dataDaftar";
import { madrasahList } from "@/lib/query/madrasahList";
import type { DetailSection, Madrasah } from "@/lib/types";
import { useQueries, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	Building2Icon,
	MapPinIcon,
	TrophyIcon,
	UsersIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/(app)/")({
	component: Home,
});

type MeData = {
	nama: string;
	nilai: string;
	asal_sekolah: string;
	no_pendaftaran: string;
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
		...dataDaftar(me.no_pendaftaran),
	});
	const mePosition = detailData ? extractPosition(detailData.data) : null;

	return (
		<Card>
			<CardHeader>
				<CardDescription className="flex w-full justify-between">
					Data Saya <Badge variant="outline">{mePosition?.status}</Badge>
				</CardDescription>
				<CardTitle className="text-xl">{me.nama}</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-1 text-sm">
				<span className="text-muted-foreground">
					Nilai: <span className="text-foreground font-medium tabular-nums">{me.nilai}</span>
				</span>
				<span className="text-muted-foreground">
					Asal: <span className="text-foreground font-medium">{me.asal_sekolah}</span>
				</span>
				<span className="text-muted-foreground">
					No. Daftar:{" "}
					<span className="text-foreground font-medium tabular-nums">{me.no_pendaftaran}</span>
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
		queries: madrasahData.map((item) => daftarList(item.lokasi_id)),
	});

	const isLoading = daftarQueries.some((q) => q.isLoading);

	let highestScore: number | null = null;
	let highestMadrasah: Madrasah | null = null;
	let lowestScore: number | null = null;
	let lowestMadrasah: Madrasah | null = null;

	for (let i = 0; i < daftarQueries.length; i++) {
		const daftar = daftarQueries[i].data;
		if (!daftar) continue;
		const scores = daftar.data.map((row) => Number(row[5])).filter((n) => !Number.isNaN(n));
		if (!scores.length) continue;
		const max = Math.max(...scores);
		const min = Math.min(...scores);
		if (highestScore === null || max > highestScore) {
			highestScore = max;
			highestMadrasah = madrasahData[i];
		}
		if (lowestScore === null || min < lowestScore) {
			lowestScore = min;
			lowestMadrasah = madrasahData[i];
		}
	}

	const totalPendaftar = daftarQueries.reduce((sum, q) => sum + (q.data?.data.length ?? 0), 0);

	return (
		<main className="flex flex-col gap-6">
			<h1>Overview</h1>

			{me && <MeCard me={me} />}

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader>
						<CardDescription className="flex items-center gap-1">
							<Building2Icon className="size-4" />
							Jumlah Madrasah
						</CardDescription>
						<CardTitle className="text-2xl tabular-nums">{madrasahData.length}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader>
						<CardDescription className="flex items-center gap-1">
							<UsersIcon className="size-4" />
							Jumlah Pendaftar
						</CardDescription>
						<CardTitle className="text-2xl tabular-nums">
							{isLoading ? <Skeleton className="h-8 w-20" /> : totalPendaftar}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader>
						<CardDescription className="flex items-center gap-1 text-green-600">
							<ArrowUpIcon className="size-4" />
							Nilai Tertinggi
						</CardDescription>
						<CardTitle className="text-2xl text-green-600 tabular-nums">
							{isLoading ? <Skeleton className="h-8 w-24" /> : (highestScore?.toFixed(2) ?? "—")}
						</CardTitle>
					</CardHeader>
					{!isLoading && highestMadrasah && (
						<CardContent>
							<p className="text-muted-foreground truncate text-xs">{highestMadrasah.nama}</p>
						</CardContent>
					)}
				</Card>
				<Card>
					<CardHeader>
						<CardDescription className="flex items-center gap-1 text-red-600">
							<ArrowDownIcon className="size-4" />
							Nilai Terendah
						</CardDescription>
						<CardTitle className="text-2xl text-red-600 tabular-nums">
							{isLoading ? <Skeleton className="h-8 w-24" /> : (lowestScore?.toFixed(2) ?? "—")}
						</CardTitle>
					</CardHeader>
					{!isLoading && lowestMadrasah && (
						<CardContent>
							<p className="text-muted-foreground truncate text-xs">{lowestMadrasah.nama}</p>
						</CardContent>
					)}
				</Card>
			</div>
		</main>
	);
}
