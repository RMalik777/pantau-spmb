import type {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
} from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	filterColumn?: string;
	filterPlaceholder?: string;
	initialColumnVisibility?: VisibilityState;
	maxHeight?: number;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	filterColumn,
	filterPlaceholder = "Filter...",
	initialColumnVisibility = {},
	maxHeight = 400,
}: Readonly<DataTableProps<TData, TValue>>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] =
		useState<VisibilityState>(initialColumnVisibility);

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		state: { sorting, columnFilters, columnVisibility },
	});

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-2">
				{filterColumn && (
					<Input
						placeholder={filterPlaceholder}
						value={(table.getColumn(filterColumn)?.getFilterValue() as string | undefined) ?? ""}
						onChange={(e) => table.getColumn(filterColumn)?.setFilterValue(e.target.value)}
						className="max-w-sm"
					/>
				)}
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button variant="outline" className="ml-auto">
								Kolom <ChevronDownIcon data-icon="inline-end" />
							</Button>
						}
					/>
					<DropdownMenuContent align="end">
						{table
							.getAllColumns()
							.filter((col) => col.getCanHide())
							.map((col) => (
								<DropdownMenuCheckboxItem
									key={col.id}
									className="capitalize"
									checked={col.getIsVisible()}
									onCheckedChange={(value) => col.toggleVisibility(!!value)}
								>
									{col.id}
								</DropdownMenuCheckboxItem>
							))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className="overflow-auto rounded-md border" style={{ maxHeight }}>
				<table className="w-full caption-bottom text-sm">
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id} className="bg-background sticky top-0 z-10">
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									Tidak ada hasil.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</table>
			</div>
		</div>
	);
}
