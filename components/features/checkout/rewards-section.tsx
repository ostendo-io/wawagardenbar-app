'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Gift, Award, Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Reward {
  _id: string;
  code: string;
  rewardType: string;
  rewardValue: number;
  expiresAt: Date;
}

interface PointsBalance {
  balance: number;
  nairaValue: number;
  conversionRate: number;
}

interface RewardsSectionProps {
  subtotal: number;
  onRewardApplied: (rewardId: string, discountAmount: number) => void;
  onRewardRemoved: () => void;
  onPointsApplied: (pointsUsed: number, discountAmount: number) => void;
  onPointsRemoved: () => void;
  appliedReward?: { id: string; discount: number };
  appliedPoints?: { points: number; discount: number };
}

export function RewardsSection({
  subtotal,
  onRewardApplied,
  onRewardRemoved,
  onPointsApplied,
  onPointsRemoved,
  appliedReward,
  appliedPoints,
}: RewardsSectionProps) {
  const { toast } = useToast();
  const [rewardCode, setRewardCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [activeRewards, setActiveRewards] = useState<Reward[]>([]);
  const [pointsBalance, setPointsBalance] = useState<PointsBalance | null>(null);
  const [pointsToUse, setPointsToUse] = useState('');
  const [isLoadingRewards, setIsLoadingRewards] = useState(true);
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);

  // Fetch active rewards and points balance
  useEffect(() => {
    async function fetchData() {
      try {
        const [rewardsRes, pointsRes] = await Promise.all([
          fetch('/api/rewards/active'),
          fetch('/api/points/balance'),
        ]);

        if (rewardsRes.ok) {
          const rewardsData = await rewardsRes.json();
          setActiveRewards(rewardsData.rewards || []);
        }

        if (pointsRes.ok) {
          const pointsData = await pointsRes.json();
          setPointsBalance(pointsData);
        }
      } catch (error) {
        console.error('Error fetching rewards/points:', error);
      } finally {
        setIsLoadingRewards(false);
        setIsLoadingPoints(false);
      }
    }

    fetchData();
  }, []);

  async function handleApplyRewardCode() {
    if (!rewardCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a reward code',
        variant: 'destructive',
      });
      return;
    }

    setIsValidating(true);

    try {
      const response = await fetch('/api/rewards/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: rewardCode }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        toast({
          title: 'Invalid Code',
          description: data.message || 'This reward code is not valid',
          variant: 'destructive',
        });
        return;
      }

      // Calculate discount
      const discount = calculateRewardDiscount(data.reward, subtotal);
      onRewardApplied(data.reward._id, discount);
      setRewardCode('');

      toast({
        title: 'Reward Applied!',
        description: `You saved ₦${discount.toLocaleString()}`,
      });
    } catch (error) {
      console.error('Error validating reward:', error);
      toast({
        title: 'Error',
        description: 'Failed to validate reward code',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  }

  function handleApplyReward(reward: Reward) {
    const discount = calculateRewardDiscount(reward, subtotal);
    onRewardApplied(reward._id, discount);

    toast({
      title: 'Reward Applied!',
      description: `You saved ₦${discount.toLocaleString()}`,
    });
  }

  function calculateRewardDiscount(reward: Reward, amount: number): number {
    switch (reward.rewardType) {
      case 'discount-percentage':
        return Math.round(amount * (reward.rewardValue / 100));
      case 'discount-fixed':
        return Math.min(reward.rewardValue, amount);
      case 'loyalty-points':
        return Math.min(Math.floor(reward.rewardValue / (pointsBalance?.conversionRate || 100)), amount);
      default:
        return 0;
    }
  }

  function handleApplyPoints() {
    if (!pointsBalance || !pointsToUse) {
      return;
    }

    const points = parseInt(pointsToUse, 10);

    if (isNaN(points) || points <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid number of points',
        variant: 'destructive',
      });
      return;
    }

    if (points > pointsBalance.balance) {
      toast({
        title: 'Insufficient Points',
        description: `You only have ${pointsBalance.balance.toLocaleString()} points`,
        variant: 'destructive',
      });
      return;
    }

    const discount = Math.floor(points / pointsBalance.conversionRate);

    if (discount > subtotal) {
      toast({
        title: 'Points Exceed Subtotal',
        description: 'You cannot use more points than the order subtotal',
        variant: 'destructive',
      });
      return;
    }

    onPointsApplied(points, discount);
    setPointsToUse('');

    toast({
      title: 'Points Applied!',
      description: `You saved ₦${discount.toLocaleString()} using ${points.toLocaleString()} points`,
    });
  }

  function getRewardTitle(reward: Reward): string {
    switch (reward.rewardType) {
      case 'discount-percentage':
        return `${reward.rewardValue}% Off`;
      case 'discount-fixed':
        return `₦${reward.rewardValue.toLocaleString()} Off`;
      case 'free-item':
        return 'Free Item';
      case 'loyalty-points':
        return `${reward.rewardValue} Points`;
      default:
        return 'Reward';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Rewards & Points
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Applied Reward Display */}
        {appliedReward && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Reward Applied</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRewardRemoved}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-1 text-sm text-green-700 dark:text-green-400">
              Saved ₦{appliedReward.discount.toLocaleString()}
            </p>
          </div>
        )}

        {/* Applied Points Display */}
        {appliedPoints && (
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-900 dark:bg-purple-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Points Applied</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onPointsRemoved}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-1 text-sm text-purple-700 dark:text-purple-400">
              {appliedPoints.points.toLocaleString()} points = ₦{appliedPoints.discount.toLocaleString()}
            </p>
          </div>
        )}

        {!appliedReward && !appliedPoints && (
          <>
            {/* Reward Code Input */}
            <div className="space-y-2">
              <Label htmlFor="rewardCode">Have a Reward Code?</Label>
              <div className="flex gap-2">
                <Input
                  id="rewardCode"
                  placeholder="Enter code"
                  value={rewardCode}
                  onChange={(e) => setRewardCode(e.target.value.toUpperCase())}
                  disabled={isValidating}
                />
                <Button
                  onClick={handleApplyRewardCode}
                  disabled={isValidating || !rewardCode.trim()}
                  size="sm"
                >
                  {isValidating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Active Rewards */}
            {isLoadingRewards ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : activeRewards.length > 0 ? (
              <div className="space-y-2">
                <Label>Your Active Rewards</Label>
                <div className="space-y-2">
                  {activeRewards.map((reward) => (
                    <div
                      key={reward._id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium text-sm">{getRewardTitle(reward)}</p>
                        <p className="text-xs text-muted-foreground">
                          Code: {reward.code}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApplyReward(reward)}
                      >
                        Apply
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Points Redemption */}
            {!isLoadingPoints && pointsBalance && pointsBalance.balance > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pointsToUse">Use Loyalty Points</Label>
                    <Badge variant="secondary">
                      {pointsBalance.balance.toLocaleString()} pts available
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {pointsBalance.conversionRate} points = ₦1
                  </p>
                  <div className="flex gap-2">
                    <Input
                      id="pointsToUse"
                      type="number"
                      placeholder="Enter points"
                      value={pointsToUse}
                      onChange={(e) => setPointsToUse(e.target.value)}
                      min="0"
                      max={pointsBalance.balance}
                    />
                    <Button
                      onClick={handleApplyPoints}
                      disabled={!pointsToUse}
                      size="sm"
                    >
                      Apply
                    </Button>
                  </div>
                  {pointsToUse && !isNaN(parseInt(pointsToUse, 10)) && (
                    <p className="text-xs text-muted-foreground">
                      = ₦{Math.floor(parseInt(pointsToUse, 10) / pointsBalance.conversionRate).toLocaleString()}
                    </p>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
