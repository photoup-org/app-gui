"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";

export interface ColumnDef<T> {
  header: React.ReactNode;
  cell: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  expandableContent?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  expandableContent,
  emptyMessage = "Sem dados disponíveis.",
  onRowClick
}: DataTableProps<T>) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleRow = (id: string, item: T) => {
    if (expandableContent) {
      setExpandedRow(prev => prev === id ? null : id);
    }
    if (onRowClick) {
      onRowClick(item);
    }
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg bg-slate-50 dark:bg-slate-900/20 text-slate-500 dark:text-slate-400">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-900">
          <TableRow>
            {expandableContent && <TableHead className="w-10"></TableHead>}
            {columns.map((col, idx) => (
              <TableHead key={idx} className={col.headerClassName}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
            const id = keyExtractor(item);
            const isExpanded = expandedRow === id;
            const isInteractive = !!expandableContent || !!onRowClick;

            return (
              <React.Fragment key={id}>
                <TableRow
                  className={isInteractive ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50" : ""}
                  onClick={() => toggleRow(id, item)}
                >
                  {expandableContent && (
                    <TableCell className="pl-4">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      )}
                    </TableCell>
                  )}
                  {columns.map((col, idx) => (
                    <TableCell key={idx} className={col.className}>
                      {col.cell(item)}
                    </TableCell>
                  ))}
                </TableRow>
                {expandableContent && isExpanded && (
                  <TableRow className="bg-slate-50/50 dark:bg-slate-900/20 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 border-b">
                    <TableCell colSpan={columns.length + 1} className="p-0">
                      <div className="p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        {expandableContent(item)}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
