'use client';

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Rewards issued over time data
 */
interface RewardsOverTimeData {
  date: string;
  issued: number;
  redeemed: number;
}

/**
 * Rewards by type data
 */
interface RewardsByTypeData {
  type: string;
  count: number;
  percentage: number;
}

/**
 * Top performing rule data
 */
interface TopPerformingRule {
  ruleId: string;
  ruleName: string;
  issued: number;
  redeemed: number;
  rate: number;
  totalValue: number;
}

interface RewardChartsProps {
  overTimeData: RewardsOverTimeData[];
  byTypeData: RewardsByTypeData[];
  topRulesData: TopPerformingRule[];
}

/**
 * Colors for pie chart
 */
const PIE_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];

/**
 * Get color for redemption rate
 */
function getRateColor(rate: number): string {
  if (rate >= 60) return '#10B981'; // Green
  if (rate >= 30) return '#F59E0B'; // Yellow
  return '#EF4444'; // Red
}

/**
 * Format type label
 */
function formatTypeLabel(type: string): string {
  switch (type) {
    case 'discount-percentage':
      return 'Percentage';
    case 'discount-fixed':
      return 'Fixed';
    case 'free-item':
      return 'Free Item';
    case 'loyalty-points':
      return 'Points';
    default:
      return type;
  }
}

/**
 * Reward charts component
 */
export function RewardCharts({ overTimeData, byTypeData, topRulesData }: RewardChartsProps) {
  // Prepare data for charts
  const formattedByTypeData = byTypeData.map((item) => ({
    ...item,
    name: formatTypeLabel(item.type),
  }));

  const topRulesWithColor = topRulesData.map((rule) => ({
    ...rule,
    color: getRateColor(rule.rate),
  }));

  return (
    <div className="space-y-6">
      {/* Rewards Over Time - Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Rewards Issued Over Time</CardTitle>
          <CardDescription>Last 30 days - Issued vs Redeemed</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={overTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(value) => {
                  const date = new Date(value as string);
                  return date.toLocaleDateString();
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="issued"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Issued"
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="redeemed"
                stroke="#10B981"
                strokeWidth={2}
                name="Redeemed"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Rewards By Type - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Rewards by Type</CardTitle>
            <CardDescription>Distribution of reward types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={formattedByTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.name}: ${props.percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {formattedByTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string, props: any) => [
                    `${value} (${props.payload.percentage.toFixed(1)}%)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performing Rules - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Redemption Rate by Rule</CardTitle>
            <CardDescription>Top 10 rules by redemption rate</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topRulesWithColor} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="ruleName"
                  width={120}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) =>
                    value.length > 15 ? `${value.substring(0, 15)}...` : value
                  }
                />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Redemption Rate']}
                  labelFormatter={(label) => `Rule: ${label}`}
                />
                <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                  {topRulesWithColor.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Rules</CardTitle>
          <CardDescription>Detailed performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-medium text-sm">Rank</th>
                  <th className="text-left py-2 px-4 font-medium text-sm">Rule Name</th>
                  <th className="text-right py-2 px-4 font-medium text-sm">Issued</th>
                  <th className="text-right py-2 px-4 font-medium text-sm">Redeemed</th>
                  <th className="text-right py-2 px-4 font-medium text-sm">Rate</th>
                  <th className="text-right py-2 px-4 font-medium text-sm">Total Value</th>
                </tr>
              </thead>
              <tbody>
                {topRulesData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted-foreground">
                      No data available
                    </td>
                  </tr>
                ) : (
                  topRulesData.map((rule, index) => (
                    <tr key={rule.ruleId} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4 text-sm">{index + 1}</td>
                      <td className="py-2 px-4 text-sm font-medium">{rule.ruleName}</td>
                      <td className="py-2 px-4 text-sm text-right">{rule.issued}</td>
                      <td className="py-2 px-4 text-sm text-right">{rule.redeemed}</td>
                      <td className="py-2 px-4 text-sm text-right">
                        <span
                          className="font-medium"
                          style={{ color: getRateColor(rule.rate) }}
                        >
                          {rule.rate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2 px-4 text-sm text-right">
                        ₦{rule.totalValue.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
