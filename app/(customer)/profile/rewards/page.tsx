import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { RewardsService } from '@/services';
import { sessionOptions, SessionData } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Gift, TrendingUp, Award, Clock } from 'lucide-react';
import { IReward } from '@/interfaces';

/**
 * User rewards page
 * Shows active rewards, history, and statistics
 */
export default async function RewardsPage() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.userId) {
    redirect('/login?redirect=/profile/rewards');
  }

  const [activeRewards, rewardHistory, stats] = await Promise.all([
    RewardsService.getUserActiveRewards(session.userId),
    RewardsService.getUserRewardHistory(session.userId, { limit: 10 }),
    RewardsService.getUserRewardStats(session.userId),
  ]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Rewards</h1>
          <p className="text-muted-foreground">
            Manage your rewards and track your savings
          </p>
        </div>
        
        <Link href="/profile">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Gift className="h-4 w-4 text-primary" />
              Active Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.activeRewards}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalEarned}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Award className="h-4 w-4 text-yellow-600" />
              Total Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ₦{stats.totalSavings.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Award className="h-4 w-4 text-purple-600" />
              Loyalty Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.loyaltyPoints}</p>
            <p className="text-xs text-muted-foreground">
              = ₦{Math.floor(stats.loyaltyPoints / 100)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active Rewards ({activeRewards.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            History ({rewardHistory.total})
          </TabsTrigger>
        </TabsList>

        {/* Active Rewards Tab */}
        <TabsContent value="active" className="space-y-4">
          {activeRewards.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Gift className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No active rewards</h3>
                <p className="mb-4 text-center text-muted-foreground">
                  Keep ordering to earn rewards!
                </p>
                <Link href="/menu">
                  <Button>Browse Menu</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeRewards.map((reward) => (
                <RewardCard key={reward._id.toString()} reward={reward} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {rewardHistory.rewards.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No reward history</h3>
                <p className="text-center text-muted-foreground">
                  Your reward history will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {rewardHistory.rewards.map((reward) => (
                <RewardHistoryCard key={reward._id.toString()} reward={reward} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Active reward card component
 */
function RewardCard({ reward }: { reward: IReward }) {
  function getRewardTitle(rewardType: string, value: number): string {
    switch (rewardType) {
      case 'discount-percentage':
        return `${value}% Discount`;
      case 'discount-fixed':
        return `₦${value.toLocaleString()} Off`;
      case 'free-item':
        return 'Free Item';
      case 'loyalty-points':
        return `${value} Loyalty Points`;
      default:
        return 'Reward';
    }
  }

  function formatExpiryDate(date: Date): string {
    const expiryDate = new Date(date);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      return 'Expires today!';
    }
    if (diffDays <= 3) {
      return `Expires in ${diffDays} days`;
    }
    return `Valid until ${expiryDate.toLocaleDateString()}`;
  }

  const expiryWarning = new Date(reward.expiresAt).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              {getRewardTitle(reward.rewardType, reward.rewardValue)}
            </CardTitle>
            <CardDescription className="mt-1">
              Reward Code: <code className="font-mono font-semibold">{reward.code}</code>
            </CardDescription>
          </div>
          <Badge variant={expiryWarning ? 'destructive' : 'secondary'}>
            {formatExpiryDate(reward.expiresAt)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex gap-2">
          <Link href="/menu" className="flex-1">
            <Button className="w-full" variant="default">
              Use Now
            </Button>
          </Link>
          <Link href="/checkout">
            <Button variant="outline">Apply at Checkout</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Reward history card component
 */
function RewardHistoryCard({ reward }: { reward: IReward }) {
  function getRewardTitle(rewardType: string, value: number): string {
    switch (rewardType) {
      case 'discount-percentage':
        return `${value}% Discount`;
      case 'discount-fixed':
        return `₦${value.toLocaleString()} Off`;
      case 'free-item':
        return 'Free Item';
      case 'loyalty-points':
        return `${value} Loyalty Points`;
      default:
        return 'Reward';
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'redeemed':
        return <Badge variant="secondary">Redeemed</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Gift className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">
              {getRewardTitle(reward.rewardType, reward.rewardValue)}
            </p>
            <p className="text-sm text-muted-foreground">
              Code: {reward.code} • Earned {new Date(reward.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="text-right">
          {getStatusBadge(reward.status)}
          {reward.redeemedAt && (
            <p className="mt-1 text-xs text-muted-foreground">
              Redeemed {new Date(reward.redeemedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Generate metadata
 */
export const metadata = {
  title: 'My Rewards - Wawa Garden Bar',
  description: 'View and manage your rewards',
};
