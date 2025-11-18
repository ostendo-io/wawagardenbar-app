'use client';

import { useState } from 'react';
import { Eye, XCircle, Percent, DollarSign, Gift, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { IReward } from '@/interfaces';
import { expireRewardAction, getRewardDetailsAction } from '@/app/actions/admin/issued-rewards-actions';

interface IssuedRewardsTableProps {
  rewards: IReward[];
  onRefresh: () => void;
}

/**
 * Get icon for reward type
 */
function getRewardTypeIcon(type: string) {
  switch (type) {
    case 'discount-percentage':
      return Percent;
    case 'discount-fixed':
      return DollarSign;
    case 'free-item':
      return Gift;
    case 'loyalty-points':
      return Star;
    default:
      return DollarSign;
  }
}

/**
 * Format reward value
 */
function formatRewardValue(reward: IReward): string {
  switch (reward.rewardType) {
    case 'discount-percentage':
      return `${reward.rewardValue}%`;
    case 'discount-fixed':
      return `₦${reward.rewardValue.toLocaleString()}`;
    case 'free-item':
      return 'Free Item';
    case 'loyalty-points':
      return `${reward.rewardValue} pts`;
    default:
      return reward.rewardValue.toString();
  }
}

/**
 * Get status badge variant
 */
function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'active':
      return 'default';
    case 'redeemed':
      return 'secondary';
    case 'expired':
      return 'destructive';
    default:
      return 'secondary';
  }
}

/**
 * Issued rewards table component
 */
export function IssuedRewardsTable({ rewards, onRefresh }: IssuedRewardsTableProps) {
  const { toast } = useToast();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleViewDetails = async (reward: IReward) => {
    setIsLoading(true);
    try {
      const result = await getRewardDetailsAction(reward._id.toString());
      
      if (result.success && result.data) {
        setSelectedReward(result.data);
        setDetailsOpen(true);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to load reward details',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load reward details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpire = async (reward: IReward) => {
    if (reward.status !== 'active') {
      toast({
        title: 'Error',
        description: 'Only active rewards can be expired',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await expireRewardAction(reward._id.toString());
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        onRefresh();
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to expire reward',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rewards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No rewards found
                </TableCell>
              </TableRow>
            ) : (
              rewards.map((reward) => {
                const Icon = getRewardTypeIcon(reward.rewardType);
                const userEmail = (reward.userId as any)?.email || 'Unknown';

                return (
                  <TableRow key={reward._id.toString()}>
                    <TableCell>
                      <code className="text-xs font-mono">{reward.code}</code>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{userEmail}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm capitalize">
                          {reward.rewardType.replace('-', ' ')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{formatRewardValue(reward)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(reward.status)}>
                        {reward.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(reward.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(reward.expiresAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(reward)}
                          disabled={isLoading}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                        {reward.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleExpire(reward)}
                            disabled={isLoading}
                          >
                            <XCircle className="h-4 w-4" />
                            <span className="sr-only">Expire</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Reward Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reward Details</DialogTitle>
            <DialogDescription>
              Complete information about this reward
            </DialogDescription>
          </DialogHeader>
          
          {selectedReward && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Reward Code
                  </label>
                  <p className="text-sm font-mono">{selectedReward.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge variant={getStatusVariant(selectedReward.status)}>
                      {selectedReward.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    User Email
                  </label>
                  <p className="text-sm">{selectedReward.userEmail || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    User Name
                  </label>
                  <p className="text-sm">{selectedReward.userName || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Reward Type
                  </label>
                  <p className="text-sm capitalize">
                    {selectedReward.rewardType.replace('-', ' ')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Reward Value
                  </label>
                  <p className="text-sm font-medium">
                    {formatRewardValue(selectedReward)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Issued Date
                  </label>
                  <p className="text-sm">
                    {new Date(selectedReward.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Expires Date
                  </label>
                  <p className="text-sm">
                    {new Date(selectedReward.expiresAt).toLocaleString()}
                  </p>
                </div>
                {selectedReward.redeemedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Redeemed Date
                    </label>
                    <p className="text-sm">
                      {new Date(selectedReward.redeemedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {selectedReward.earnedFromOrder && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Earned From Order
                  </label>
                  <p className="text-sm">
                    #{selectedReward.earnedFromOrder.orderNumber} - ₦
                    {selectedReward.earnedFromOrder.total.toLocaleString()} on{' '}
                    {new Date(selectedReward.earnedFromOrder.date).toLocaleDateString()}
                  </p>
                </div>
              )}

              {selectedReward.usedInOrder && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Used In Order
                  </label>
                  <p className="text-sm">
                    #{selectedReward.usedInOrder.orderNumber} - Discount: ₦
                    {selectedReward.usedInOrder.discountApplied.toLocaleString()} on{' '}
                    {new Date(selectedReward.usedInOrder.date).toLocaleDateString()}
                  </p>
                </div>
              )}

              {selectedReward.ruleName && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Reward Rule
                  </label>
                  <p className="text-sm font-medium">{selectedReward.ruleName}</p>
                  {selectedReward.ruleDescription && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedReward.ruleDescription}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
