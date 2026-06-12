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
		accessorFn: (row) => row[0],
		header: "No.",
		size: 60,
	},
	{
		id: "nama",
		accessorFn: (row) => decodeHtml(row[3]),
		header: ({ column }) => <SortHeader label="Nama" column={column} />,
	},
	{
		id: "nilai",
		accessorFn: (row) => row[5],
		header: ({ column }) => <SortHeader label="Nilai" column={column} />,
		cell: ({ row }) => <div className="tabular-nums">{row.getValue("nilai")}</div>,
		size: 125,
	},
	{
		id: "asal_sekolah",
		accessorFn: (row) => row[4],
		header: ({ column }) => <SortHeader label="Asal Sekolah" column={column} />,
		size: 300,
	},
	{
		id: "no_pendaftaran",
		accessorFn: (row) => row[1],
		header: ({ column }) => <SortHeader label="No. Daftar" column={column} />,
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
									no_pendaftaran: row.getValue("no_pendaftaran"),
								};
								const id = row.getValue<string>("no_pendaftaran");
								localStorage.setItem("me", JSON.stringify(data));
								localStorage.setItem("me_id", id);
							}}
						>
							<UserIcon data-icon="inline-start" />
							Set as me
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		),
	},
];
