'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Power,
  PowerOff,
  Percent,
  DollarSign,
  Gift,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { IRewardRule } from '@/interfaces';
import {
  deleteRewardRuleAction,
  toggleRewardRuleStatusAction,
  duplicateRewardRuleAction,
} from '@/app/actions/admin/reward-rules-actions';

interface RewardRuleTableProps {
  rules: IRewardRule[];
  selectedRules: string[];
  onSelectionChange: (ruleIds: string[]) => void;
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
 * Get label for reward type
 */
function getRewardTypeLabel(type: string) {
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
 * Format reward value for display
 */
function formatRewardValue(rule: IRewardRule): string {
  switch (rule.rewardType) {
    case 'discount-percentage':
      return `${rule.rewardValue}%`;
    case 'discount-fixed':
      return `₦${rule.rewardValue.toLocaleString()}`;
    case 'free-item':
      return 'Free Item';
    case 'loyalty-points':
      return `${rule.rewardValue} pts`;
    default:
      return rule.rewardValue.toString();
  }
}

/**
 * Reward rule table component
 */
export function RewardRuleTable({
  rules,
  selectedRules,
  onSelectionChange,
}: RewardRuleTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<IRewardRule | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(rules.map((rule) => rule._id.toString()));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRule = (ruleId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedRules, ruleId]);
    } else {
      onSelectionChange(selectedRules.filter((id) => id !== ruleId));
    }
  };

  const handleToggleStatus = async (rule: IRewardRule) => {
    setIsLoading(true);
    try {
      const result = await toggleRewardRuleStatusAction(rule._id.toString());
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        router.refresh();
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
        description: 'Failed to toggle rule status',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async (rule: IRewardRule) => {
    setIsLoading(true);
    try {
      const result = await duplicateRewardRuleAction(rule._id.toString());
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        router.refresh();
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
        description: 'Failed to duplicate rule',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (rule: IRewardRule) => {
    setRuleToDelete(rule);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!ruleToDelete) return;

    setIsLoading(true);
    try {
      const result = await deleteRewardRuleAction(ruleToDelete._id.toString());
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        router.refresh();
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
        description: 'Failed to delete rule',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setRuleToDelete(null);
    }
  };

  const allSelected = rules.length > 0 && selectedRules.length === rules.length;
  const someSelected = selectedRules.length > 0 && selectedRules.length < rules.length;

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  className={someSelected ? 'data-[state=checked]:bg-primary/50' : ''}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Threshold</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Probability</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No reward rules found
                </TableCell>
              </TableRow>
            ) : (
              rules.map((rule) => {
                const Icon = getRewardTypeIcon(rule.rewardType);
                const isSelected = selectedRules.includes(rule._id.toString());

                return (
                  <TableRow key={rule._id.toString()}>
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleSelectRule(rule._id.toString(), checked as boolean)
                        }
                        aria-label={`Select ${rule.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{rule.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {rule.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {getRewardTypeLabel(rule.rewardType)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {rule.spendThreshold === 0
                          ? 'No minimum'
                          : `₦${rule.spendThreshold.toLocaleString()}`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{formatRewardValue(rule)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {Math.round(rule.probability * 100)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isLoading}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/dashboard/rewards/rules/${rule._id}`)
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(rule)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(rule)}>
                            {rule.isActive ? (
                              <>
                                <PowerOff className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Power className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(rule)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reward Rule?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{ruleToDelete?.name}&quot;?
              <br />
              <br />
              This action cannot be undone. However, already issued rewards will not be
              affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Rule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
