import type { Column, ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDownIcon } from "lucide-react";

export type MadrasahStat = {
	nama: string;
	jumlah: number;
	mean: number | null;
	median: number | null;
	highest: number | null;
	lowest: number | null;
};

function SortHeader({ label, column }: Readonly<{ label: string; column: Column<MadrasahStat> }>) {
	return (
		<Button
			variant="ghost"
			className="-ml-3"
			onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
		>
			{label}
			<ArrowUpDownIcon data-icon="inline-end" />
		</Button>
	);
}

function NumCell({ value }: Readonly<{ value: number | null }>) {
	return <div className="tabular-nums">{value?.toFixed(2) ?? "—"}</div>;
}

export const madrasahStatColumns: ColumnDef<MadrasahStat>[] = [
	{
		id: "nama",
		accessorKey: "nama",
		header: ({ column }) => <SortHeader label="Madrasah" column={column} />,
	},
	{
		id: "jumlah",
		accessorKey: "jumlah",
		header: ({ column }) => <SortHeader label="Peserta" column={column} />,
		cell: ({ getValue }) => (
			<div className="tabular-nums">{(getValue() as number).toLocaleString()}</div>
		),
	},
	{
		id: "mean",
		accessorKey: "mean",
		header: ({ column }) => <SortHeader label="Rata-rata" column={column} />,
		cell: ({ getValue }) => <NumCell value={getValue() as number | null} />,
	},
	{
		id: "median",
		accessorKey: "median",
		header: ({ column }) => <SortHeader label="Median" column={column} />,
		cell: ({ getValue }) => <NumCell value={getValue() as number | null} />,
	},
	{
		id: "highest",
		accessorKey: "highest",
		header: ({ column }) => <SortHeader label="Tertinggi" column={column} />,
		cell: ({ getValue }) => <NumCell value={getValue() as number | null} />,
	},
	{
		id: "lowest",
		accessorKey: "lowest",
		header: ({ column }) => <SortHeader label="Terendah" column={column} />,
		cell: ({ getValue }) => <NumCell value={getValue() as number | null} />,
	},
];
