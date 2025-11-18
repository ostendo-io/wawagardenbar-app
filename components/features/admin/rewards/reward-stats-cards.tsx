'use client';

import {
  Settings,
  Gift,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Clock,
  LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardData {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  color: string;
  trend?: string;
}

interface RewardStatsCardsProps {
  stats: {
    totalRulesActive: number;
    totalRewardsIssued: number;
    totalRewardsRedeemed: number;
    activeRewards: number;
    totalValueRedeemed: number;
    redemptionRate: number;
  };
}

/**
 * Reward statistics cards component
 */
export function RewardStatsCards({ stats }: RewardStatsCardsProps) {
  const cards: StatCardData[] = [
    {
      title: 'Active Rules',
      value: stats.totalRulesActive,
      description: 'Currently active reward rules',
      icon: Settings,
      color: 'text-blue-600',
    },
    {
      title: 'Rewards Issued',
      value: stats.totalRewardsIssued.toLocaleString(),
      description: 'All time',
      icon: Gift,
      color: 'text-green-600',
    },
    {
      title: 'Rewards Redeemed',
      value: stats.totalRewardsRedeemed.toLocaleString(),
      description: 'Successfully used',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Redemption Rate',
      value: `${stats.redemptionRate.toFixed(1)}%`,
      description: 'Redeemed / Issued',
      icon: TrendingUp,
      color: 'text-blue-600',
      trend: stats.redemptionRate >= 60 ? 'Above target' : 'Target: 60%',
    },
    {
      title: 'Total Value',
      value: `₦${stats.totalValueRedeemed.toLocaleString()}`,
      description: 'Discount value given',
      icon: DollarSign,
      color: 'text-purple-600',
    },
    {
      title: 'Active Rewards',
      value: stats.activeRewards.toLocaleString(),
      description: 'Valid, unredeemed',
      icon: Clock,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
              {card.trend && (
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  {card.trend}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
