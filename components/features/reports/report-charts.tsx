'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DailySummaryReport } from '@/services/financial-report-service';

interface ReportChartsProps {
  report: DailySummaryReport;
}

export function ReportCharts({ report }: ReportChartsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      notation: 'compact',
    }).format(amount);
  };

  // Calculate percentages for pie charts
  const revenueData = [
    { name: 'Food', value: report.revenue.food.totalRevenue, color: '#22c55e' },
    { name: 'Drink', value: report.revenue.drink.totalRevenue, color: '#3b82f6' },
  ];

  const costData = [
    { name: 'Food Costs', value: report.costs.food.totalCost, color: '#f97316' },
    { name: 'Drink Costs', value: report.costs.drink.totalCost, color: '#a855f7' },
  ];


  const renderSimplePieChart = (data: typeof revenueData, total: number) => {
    let currentAngle = 0;
    
    return (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const angle = (item.value / total) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          
          currentAngle = endAngle;

          // Calculate path for pie slice
          const startX = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
          const startY = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
          const endX = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
          const endY = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
          
          const largeArc = angle > 180 ? 1 : 0;
          
          const pathData = [
            `M 100 100`,
            `L ${startX} ${startY}`,
            `A 80 80 0 ${largeArc} 1 ${endX} ${endY}`,
            `Z`
          ].join(' ');

          return (
            <g key={index}>
              <path
                d={pathData}
                fill={item.color}
                stroke="white"
                strokeWidth="2"
              />
              {percentage > 5 && (
                <text
                  x={100 + 50 * Math.cos(((startAngle + endAngle) / 2 - 90) * Math.PI / 180)}
                  y={100 + 50 * Math.sin(((startAngle + endAngle) / 2 - 90) * Math.PI / 180)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {percentage.toFixed(0)}%
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  const renderBarChart = (data: { label: string; value: number; color: string }[]) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="font-semibold">{formatCurrency(item.value)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-8 relative overflow-hidden">
                <div
                  className="h-full rounded-full transition-all flex items-center justify-end pr-2"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: item.color
                  }}
                >
                  {percentage > 15 && (
                    <span className="text-xs font-bold text-white">
                      {percentage.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Revenue Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square max-w-[300px] mx-auto">
              {renderSimplePieChart(revenueData, report.revenue.totalRevenue)}
            </div>
            <div className="mt-4 space-y-2">
              {revenueData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square max-w-[300px] mx-auto">
              {renderSimplePieChart(costData, report.costs.totalDirectCosts)}
            </div>
            <div className="mt-4 space-y-2">
              {costData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Gross Profit by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {renderBarChart([
            { label: 'Food', value: report.grossProfit.food, color: '#22c55e' },
            { label: 'Drink', value: report.grossProfit.drink, color: '#3b82f6' },
          ])}
        </CardContent>
      </Card>

      {/* Financial Overview Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {renderBarChart([
            { label: 'Total Revenue', value: report.revenue.totalRevenue, color: '#3b82f6' },
            { label: 'Total Costs (COGS)', value: report.costs.totalDirectCosts, color: '#f97316' },
            { label: 'Gross Profit', value: report.grossProfit.total, color: '#22c55e' },
            { label: 'Operating Expenses', value: report.operatingExpenses.totalExpenses, color: '#ef4444' },
            { 
              label: report.netProfit >= 0 ? 'Net Profit' : 'Net Loss', 
              value: Math.abs(report.netProfit), 
              color: report.netProfit >= 0 ? '#10b981' : '#dc2626' 
            },
          ])}
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Gross Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {report.metrics.grossProfitMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Revenue after COGS
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Net Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${report.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {report.metrics.netProfitMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Final profitability
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {formatCurrency(
                report.metrics.orderCount > 0 
                  ? report.revenue.totalRevenue / report.metrics.orderCount 
                  : 0
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Per order revenue
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
