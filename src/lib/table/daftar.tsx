import type { Column, ColumnDef } from "@tanstack/react-table";
import type { DaftarRow } from "@/lib/types";
import { decodeHtml } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDownIcon, MoreHorizontalIcon, UserIcon } from "lucide-react";

function SortHeader({ label, column }: Readonly<{ label: string; column: Column<DaftarRow> }>) {
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

export const columns: ColumnDef<DaftarRow>[] = [
	{
		id: "rank",
		accessorKey: "rank",
		header: ({ column }) => <SortHeader label="No" column={column} />,
		size: 60,
	},
	{
		id: "nama",
		accessorFn: (row) => decodeHtml(row.nama),
		header: ({ column }) => <SortHeader label="Nama" column={column} />,
	},
	{
		id: "nilai",
		accessorKey: "nilai",
		header: ({ column }) => <SortHeader label="Nilai" column={column} />,
		cell: ({ row }) => <div className="tabular-nums">{row.getValue("nilai")}</div>,
		size: 125,
	},
	{
		id: "asal_sekolah",
		accessorKey: "asal_sekolah",
		header: ({ column }) => <SortHeader label="Asal Sekolah" column={column} />,
		size: 300,
	},
	{
		id: "umur",
		accessorKey: "umur",
		header: ({ column }) => <SortHeader label="Umur" column={column} />,
		cell: ({ row }) => <div className="tabular-nums">{row.getValue("umur")}</div>,
		size: 100,
	},
	{
		id: "no_peserta",
		accessorKey: "no_peserta",
		header: ({ column }) => <SortHeader label="No. Peserta" column={column} />,
		size: 150,
	},
	{
		id: "Actions",
		size: 50,
		cell: ({ row }) => (
			<DropdownMenu>
				<DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
					<MoreHorizontalIcon data-icon />
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuGroup>
						<DropdownMenuItem
							onClick={() => {
								const data = {
									nama: row.getValue("nama"),
									nilai: row.getValue("nilai"),
									asal_sekolah: row.getValue("asal_sekolah"),
									no_peserta: row.getValue("no_peserta"),
								};
								localStorage.setItem("me", JSON.stringify(data));
							}}
						>
							<UserIcon data-icon="inline-start" />
							Set ini sebagai Saya
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		),
	},
];
