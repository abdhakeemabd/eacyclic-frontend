import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/ui/table";
import { Package } from 'lucide-react';

export const BaseTable = ({ 
  headers = [], 
  data = [], 
  renderRow, 
  emptyMessage = "No items found",
  emptySubMessage = "Try adjusting your filters.",
  className = "",
  isLoading,
  skeletonCount,
  ...props 
}) => {
  return (
    <div className={`w-full overflow-hidden ${className}`} {...props}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent bg-transparent">
              {headers.map((header, idx) => (
                <TableHead key={idx} className={`h-10 px-2 text-left align-middle whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0 font-medium text-sm max-w-[200px] ${header.className || ''}`}>
                  {header.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headers.length} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Package size={40} className="mb-3 opacity-20" />
                    <p className="font-bold text-foreground text-lg">{emptyMessage}</p>
                    <p className="text-sm mt-1">{emptySubMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => renderRow(item, index))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
