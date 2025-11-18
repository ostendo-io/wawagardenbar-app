'use client';

import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Edit } from 'lucide-react';

interface StockHistoryEntry {
  quantity: number;
  type: 'addition' | 'deduction' | 'adjustment';
  reason: string;
  category?: string;
  timestamp: string;
  performedByName?: string;
  notes?: string;
  supplier?: string;
  invoiceNumber?: string;
}

interface Props {
  history: StockHistoryEntry[];
  unit: string;
}

/**
 * Stock history table component
 * Displays all stock movements with details
 */
export function StockHistoryTable({ history, unit }: Props) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No stock movements recorded yet
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Performed By</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((entry, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                {format(new Date(entry.timestamp), 'MMM dd, yyyy HH:mm')}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {entry.type === 'addition' && (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <Badge variant="default" className="bg-green-600">
                        Addition
                      </Badge>
                    </>
                  )}
                  {entry.type === 'deduction' && (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <Badge variant="destructive">Deduction</Badge>
                    </>
                  )}
                  {entry.type === 'adjustment' && (
                    <>
                      <Edit className="h-4 w-4 text-blue-600" />
                      <Badge variant="secondary">Adjustment</Badge>
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span
                  className={
                    entry.quantity > 0
                      ? 'text-green-600 font-semibold'
                      : 'text-red-600 font-semibold'
                  }
                >
                  {entry.quantity > 0 ? '+' : ''}
                  {entry.quantity} {unit}
                </span>
              </TableCell>
              <TableCell>
                <div>
                  <p>{entry.reason}</p>
                  {entry.category && (
                    <Badge variant="outline" className="mt-1">
                      {entry.category}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{entry.performedByName || 'System'}</TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground space-y-1">
                  {entry.supplier && <p>Supplier: {entry.supplier}</p>}
                  {entry.invoiceNumber && <p>Invoice: {entry.invoiceNumber}</p>}
                  {entry.notes && <p>{entry.notes}</p>}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
