import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { DailySummaryReport } from '@/services/financial-report-service';

interface CostSectionProps {
  report: DailySummaryReport;
}

export function CostSection({ report }: CostSectionProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Food Costs */}
      <Card>
        <CardHeader>
          <CardTitle>Food Costs (COGS)</CardTitle>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(report.costs.food.totalCost)}
          </div>
        </CardHeader>
        <CardContent>
          {report.costs.food.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Cost/Unit</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.costs.food.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.costPerUnit)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(item.total)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={3} className="font-bold">
                    Total Food Cost
                  </TableCell>
                  <TableCell className="text-right font-bold text-orange-600">
                    {formatCurrency(report.costs.food.totalCost)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No food costs recorded
            </p>
          )}
        </CardContent>
      </Card>

      {/* Drink Costs */}
      <Card>
        <CardHeader>
          <CardTitle>Drink Costs (COGS)</CardTitle>
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(report.costs.drink.totalCost)}
          </div>
        </CardHeader>
        <CardContent>
          {report.costs.drink.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Cost/Unit</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.costs.drink.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.costPerUnit)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(item.total)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={3} className="font-bold">
                    Total Drink Cost
                  </TableCell>
                  <TableCell className="text-right font-bold text-purple-600">
                    {formatCurrency(report.costs.drink.totalCost)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No drink costs recorded
            </p>
          )}
        </CardContent>
      </Card>

      {/* Total COGS Summary */}
      <Card className="border-2 border-orange-500">
        <CardHeader>
          <CardTitle>Total Cost of Goods Sold (COGS)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Food Costs:</span>
              <span className="font-semibold">{formatCurrency(report.costs.food.totalCost)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Drink Costs:</span>
              <span className="font-semibold">{formatCurrency(report.costs.drink.totalCost)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total Direct Costs:</span>
                <span className="text-2xl font-bold text-orange-600">
                  {formatCurrency(report.costs.totalDirectCosts)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gross Profit Preview */}
      <Card className="bg-green-50 dark:bg-green-950 border-green-500">
        <CardHeader>
          <CardTitle>Gross Profit Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Food Gross Profit:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(report.grossProfit.food)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Drink Gross Profit:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(report.grossProfit.drink)}
              </span>
            </div>
            <div className="border-t border-green-300 pt-2">
              <div className="flex justify-between items-center">
                <span className="font-bold">Total Gross Profit:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(report.grossProfit.total)}
                </span>
              </div>
              <div className="text-right text-sm text-muted-foreground mt-1">
                {report.metrics.grossProfitMargin.toFixed(1)}% margin
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
