"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Search, AlertCircle, TriangleAlert, Info } from "lucide-react";
import { SystemLogWithUser } from "@/app/(HaaS)/logs/actions";

const formatLogDate = (dateVal: Date | string) => {
  const d = new Date(dateVal);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const getLevelBadge = (level: string) => {
  switch (level) {
    case "CRITICAL":
      return <Badge className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900/50">CRITICAL</Badge>;
    case "ERROR":
      return <Badge className="bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-900/50">ERROR</Badge>;
    case "WARN":
      return <Badge className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/50">WARN</Badge>;
    case "INFO":
    default:
      return <Badge className="bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-900/50">INFO</Badge>;
  }
};

const getLevelIcon = (level: string) => {
    switch (level) {
        case "CRITICAL": return <AlertCircle className="w-4 h-4 text-red-500 mr-2" />;
        case "ERROR":
        case "WARN": return <TriangleAlert className="w-4 h-4 text-amber-500 mr-2" />;
        case "INFO":
        default: return <Info className="w-4 h-4 text-indigo-500 mr-2" />;
    }
}

export const columns: ColumnDef<SystemLogWithUser>[] = [
  {
    accessorKey: "timestamp",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="-ml-4 h-8 data-[state=open]:bg-accent text-xs font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data / Hora
          {column.getIsSorted() === "asc" ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-xs font-medium text-slate-600 dark:text-slate-400">{formatLogDate(row.getValue("timestamp"))}</div>,
  },
  {
    accessorKey: "level",
    header: "Nível",
    cell: ({ row }) => {
      const level = row.getValue("level") as string;
      return <div className="flex items-center text-xs font-medium">{getLevelBadge(level)}</div>;
    },
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row }) => (
      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
        {row.getValue("category")}
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: "Ação",
    cell: ({ row }) => (
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {row.getValue("action")}
      </div>
    ),
  },
  {
    accessorKey: "message",
    header: "Descrição",
    cell: ({ row }) => {
        const level = row.getValue("level") as string;
        const msg = row.getValue("message") as string;
        const user = row.original.user;
        return (
            <div className="flex flex-col w-full">
                <div className="flex items-start text-xs font-medium text-slate-900 dark:text-slate-100 break-words whitespace-normal">
                    <span className="mt-0.5">{getLevelIcon(level)}</span>
                    <span className="leading-snug">{msg}</span>
                </div>
                {user && (
                    <span className="text-[10px] text-slate-500 mt-1 ml-6">
                        Despoletado por: {user.name || user.email}
                    </span>
                )}
            </div>
        )
    },
  },
];

interface IncidentesTableProps {
  data: SystemLogWithUser[];
}

export default function IncidentesTable({ data }: IncidentesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "timestamp", desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
        pagination: {
            pageSize: 15,
        }
    }
  });

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between py-4 px-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <Input
            placeholder="Filtrar por categoria..."
            value={(table.getColumn("category")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("category")?.setFilterValue(event.target.value)
            }
            className="max-w-xs h-8 text-xs bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
            />
        </div>
        <div className="flex items-center gap-2">
           <select 
             className="h-8 text-xs rounded-md border border-slate-200 bg-white px-3 py-1 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950"
             value={(table.getColumn("level")?.getFilterValue() as string) ?? ""}
             onChange={(e) => table.getColumn("level")?.setFilterValue(e.target.value)}
           >
              <option value="">Todos os níveis</option>
              <option value="CRITICAL">Critical</option>
              <option value="ERROR">Error</option>
              <option value="WARN">Warn</option>
              <option value="INFO">Info</option>
           </select>
        </div>
      </div>
      <div className="w-full">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b-slate-100 dark:border-b-slate-800">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="py-2 h-10 px-6 font-semibold text-slate-500 dark:text-slate-400">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b-slate-50 dark:border-b-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-6 py-3 whitespace-normal">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-xs text-slate-500 font-medium">
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between w-full py-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
        <div className="text-xs text-slate-500 font-medium">
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}
