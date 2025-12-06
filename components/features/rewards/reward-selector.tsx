'use client';

import { useState, useEffect } from 'react';
import { Gift, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IReward } from '@/interfaces';
import { getUserActiveRewardsAction, calculateDiscountAmountAction } from '@/app/actions/rewards/rewards-actions';
import { useToast } from '@/hooks/use-toast';

interface RewardSelectorProps {
  subtotal: number;
  onRewardSelect: (rewards: IReward[], totalDiscountAmount: number) => void;
  selectedRewardIds?: string[];
}

/**
 * Reward selector component for checkout
 * Allows users to select and apply rewards
 */
export function RewardSelector({
  subtotal,
  onRewardSelect,
  selectedRewardIds = [],
}: RewardSelectorProps) {
  const { toast } = useToast();
  const [rewards, setRewards] = useState<IReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedRewardIds);
  const [totalDiscountAmount, setTotalDiscountAmount] = useState(0);

  useEffect(() => {
    loadRewards();
  }, []);

  useEffect(() => {
    if (selectedIds.length > 0) {
      calculateTotalDiscount(selectedIds);
    } else {
      setTotalDiscountAmount(0);
      onRewardSelect([], 0);
    }
  }, [selectedIds, subtotal]);

  async function loadRewards() {
    try {
      setLoading(true);
      const result = await getUserActiveRewardsAction();

      if (result.success && result.data) {
        setRewards(result.data.rewards);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to load rewards',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading rewards:', error);
      toast({
        title: 'Error',
        description: 'Failed to load rewards',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function calculateTotalDiscount(rewardIds: string[]) {
    try {
      let totalDiscount = 0;
      const selectedRewards: IReward[] = [];

      for (const rewardId of rewardIds) {
        const result = await calculateDiscountAmountAction(rewardId, subtotal);

        if (result.success && result.data) {
          totalDiscount += result.data.discountAmount;
          const reward = rewards.find((r) => r._id.toString() === rewardId);
          if (reward) {
            selectedRewards.push(reward);
          }
        }
      }

      setTotalDiscountAmount(totalDiscount);
      onRewardSelect(selectedRewards, totalDiscount);
    } catch (error) {
      console.error('Error calculating discount:', error);
    }
  }

  function handleRewardToggle(rewardId: string, checked: boolean) {
    if (checked) {
      setSelectedIds([...selectedIds, rewardId]);
    } else {
      setSelectedIds(selectedIds.filter((id) => id !== rewardId));
    }
  }

  function clearAllRewards() {
    setSelectedIds([]);
  }

  function getRewardDescription(reward: IReward): string {
    switch (reward.rewardType) {
      case 'discount-percentage':
        return `${reward.rewardValue}% off your order`;
      case 'discount-fixed':
        return `₦${reward.rewardValue.toLocaleString()} off your order`;
      case 'free-item':
        return 'Free item included';
      case 'loyalty-points':
        return `${reward.rewardValue} points = ₦${Math.floor(reward.rewardValue / 100)}`;
      default:
        return 'Special reward';
    }
  }

  function formatExpiryDate(date: Date): string {
    const expiryDate = new Date(date);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      return 'Expires today';
    }
    if (diffDays <= 3) {
      return `Expires in ${diffDays} days`;
    }
    return `Valid until ${expiryDate.toLocaleDateString()}`;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Available Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading rewards...</p>
        </CardContent>
      </Card>
    );
  }

  if (rewards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Available Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have any active rewards. Keep ordering to earn rewards!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Available Rewards
        </CardTitle>
        <CardDescription>
          Select a reward to apply to your order
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {rewards.map((reward) => {
          const rewardId = reward._id.toString();
          const isSelected = selectedIds.includes(rewardId);
          const expiryWarning = new Date(reward.expiresAt).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;

          return (
            <div
              key={rewardId}
              className={`relative rounded-lg border-2 p-4 transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  id={rewardId}
                  checked={isSelected}
                  onCheckedChange={(checked) => handleRewardToggle(rewardId, checked as boolean)}
                  className="mt-1"
                />
                
                <div className="flex-1">
                  <Label
                    htmlFor={rewardId}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">
                        {getRewardDescription(reward)}
                      </p>
                      {isSelected && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    
                    <div className="mt-1 flex items-center gap-2">
                      <code className="text-xs text-muted-foreground">
                        {reward.code}
                      </code>
                      <Badge
                        variant={expiryWarning ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {formatExpiryDate(reward.expiresAt)}
                      </Badge>
                    </div>
                  </Label>
                </div>
              </div>
            </div>
          );
        })}

        {selectedIds.length > 0 && totalDiscountAmount > 0 && (
          <Alert className="border-primary bg-primary/5">
            <Gift className="h-4 w-4 text-primary" />
            <AlertDescription>
              <span className="font-semibold">
                You'll save ₦{totalDiscountAmount.toLocaleString()}
              </span>{' '}
              with {selectedIds.length} reward{selectedIds.length > 1 ? 's' : ''}!
            </AlertDescription>
          </Alert>
        )}

        {selectedIds.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllRewards}
            className="w-full"
          >
            Clear All Rewards
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
