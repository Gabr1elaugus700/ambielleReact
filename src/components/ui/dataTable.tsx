import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash } from "lucide-react";
import { Button } from "./button";
import { Column } from "@/types/types"

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[] ; 
  tableCaption: string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  tableCaption,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  return (
    <div className="border-2 rounded-lg shadow-xl">
      <Table>
        <TableCaption className="text-sm p-2">{tableCaption}</TableCaption>
        <TableHeader className="p-3">
          <TableRow>
            {columns.map((col) => (
              <TableHead key={String(col.key)} className="font-bold p-4">
                {col.header}
              </TableHead>
            ))}
            <TableHead className="font-bold p-4">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx}>
              {columns.map((col) => (
                <TableCell key={String(col.key)} className="p-4">
                    {col.render
                        ? col.render(row[col.key], row)
                        : (row[col.key] as React.ReactNode)
                    }
                  {/* {row[col.key as keyof Cliente] as React.ReactNode} */}
                </TableCell>
              ))}
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="px-2 py-1 text-xs rounded border-black/30 text-black hover:translate-transition hover:scale-105 hover:bg-blue-400 hover:text-black hover:border-black"
                    onClick={() => onEdit && onEdit(row)}
                  >
                    <Pencil size={16} color="black" />
                  </Button>
                  <Button
                    variant="outline"
                    className="px-2 py-1 text-xs rounded border-black/30 text-black hover:translate-transition hover:scale-105 hover:bg-red-400 hover:text-black hover:border-black"
                    onClick={() => onDelete && onDelete(row)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
