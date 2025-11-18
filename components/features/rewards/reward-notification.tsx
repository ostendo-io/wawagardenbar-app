'use client';

import { useEffect, useState } from 'react';
import { Gift, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IReward } from '@/interfaces';
import { cn } from '@/lib/utils';

interface RewardNotificationProps {
  reward: IReward | null;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

/**
 * Reward notification component
 * Shows when user earns a new reward
 */
export function RewardNotification({
  reward,
  onClose,
  autoClose = true,
  autoCloseDelay = 8000,
}: RewardNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (reward) {
      // Show notification with animation
      setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 100);

      // Auto close
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);

        return () => clearTimeout(timer);
      }
    }

    return undefined;
  }, [reward, autoClose, autoCloseDelay]);

  function handleClose() {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    }, 300);
  }

  if (!reward || !isVisible) {
    return null;
  }

  function getRewardTitle(rewardType: string): string {
    switch (rewardType) {
      case 'discount-percentage':
        return '🎉 Discount Reward!';
      case 'discount-fixed':
        return '🎁 Cash Discount!';
      case 'free-item':
        return '🍔 Free Item!';
      case 'loyalty-points':
        return '⭐ Loyalty Points!';
      default:
        return '🎊 Reward Earned!';
    }
  }

  function getRewardDescription(rewardType: string, value: number): string {
    switch (rewardType) {
      case 'discount-percentage':
        return `You've earned ${value}% off your next order!`;
      case 'discount-fixed':
        return `You've earned ₦${value.toLocaleString()} off your next order!`;
      case 'free-item':
        return "You've earned a free item on your next order!";
      case 'loyalty-points':
        return `You've earned ${value} loyalty points!`;
      default:
        return 'Congratulations on your reward!';
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
    if (diffDays <= 7) {
      return `Expires in ${diffDays} days`;
    }
    return `Valid until ${expiryDate.toLocaleDateString()}`;
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 max-w-md transition-all duration-300',
        isAnimating
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      )}
    >
      <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg">
        <CardHeader className="relative pb-3">
          <div className="absolute -right-2 -top-2 animate-bounce">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/20 p-2">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">
              {getRewardTitle(reward.rewardType)}
            </CardTitle>
          </div>
          
          <CardDescription className="mt-2">
            {getRewardDescription(reward.rewardType, reward.rewardValue)}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Reward Code */}
          <div className="rounded-lg bg-background p-3">
            <p className="mb-1 text-xs text-muted-foreground">Reward Code</p>
            <div className="flex items-center justify-between">
              <code className="text-lg font-bold tracking-wider">
                {reward.code}
              </code>
              <Badge variant="secondary">
                {formatExpiryDate(reward.expiresAt)}
              </Badge>
            </div>
          </div>

          {/* Call to Action */}
          <div className="flex gap-2">
            <Button
              variant="default"
              className="flex-1"
              onClick={() => {
                // Navigate to checkout or menu
                window.location.href = '/menu';
              }}
            >
              Use Now
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // Navigate to rewards page
                window.location.href = '/profile/rewards';
              }}
            >
              View All Rewards
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Reward will be automatically applied at checkout
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Compact reward badge for displaying in UI
 */
export function RewardBadge({ reward }: { reward: IReward }) {
  function getRewardLabel(rewardType: string, value: number): string {
    switch (rewardType) {
      case 'discount-percentage':
        return `${value}% OFF`;
      case 'discount-fixed':
        return `₦${value} OFF`;
      case 'free-item':
        return 'FREE ITEM';
      case 'loyalty-points':
        return `${value} PTS`;
      default:
        return 'REWARD';
    }
  }

  return (
    <Badge
      variant="default"
      className="gap-1 bg-gradient-to-r from-primary to-primary/80"
    >
      <Gift className="h-3 w-3" />
      {getRewardLabel(reward.rewardType, reward.rewardValue)}
    </Badge>
  );
}
