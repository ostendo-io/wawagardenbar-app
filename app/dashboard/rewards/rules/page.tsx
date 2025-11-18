'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Power, PowerOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { RewardRuleTable } from '@/components/features/admin/rewards';
import { IRewardRule } from '@/interfaces';
import {
  getRewardRulesAction,
  bulkUpdateRewardRulesAction,
} from '@/app/actions/admin/reward-rules-actions';

/**
 * Reward rules list page
 */
export default function RewardRulesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [rules, setRules] = useState<IRewardRule[]>([]);
  const [filteredRules, setFilteredRules] = useState<IRewardRule[]>([]);
  const [selectedRules, setSelectedRules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Fetch rules
  useEffect(() => {
    async function fetchRules() {
      setIsLoading(true);
      try {
        const result = await getRewardRulesAction();
        if (result.success && result.data) {
          setRules(result.data.data);
          setFilteredRules(result.data.data);
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to load reward rules',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load reward rules',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchRules();
  }, [toast]);

  // Apply filters
  useEffect(() => {
    let filtered = [...rules];

    // Status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter((rule) => rule.isActive === isActive);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((rule) => rule.rewardType === typeFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (rule) =>
          rule.name.toLowerCase().includes(query) ||
          rule.description.toLowerCase().includes(query)
      );
    }

    setFilteredRules(filtered);
  }, [rules, statusFilter, typeFilter, searchQuery]);

  const handleBulkActivate = async () => {
    if (selectedRules.length === 0) return;

    setIsBulkLoading(true);
    try {
      const result = await bulkUpdateRewardRulesAction(selectedRules, 'activate');
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        setSelectedRules([]);
        router.refresh();
        // Refresh the list
        const refreshResult = await getRewardRulesAction();
        if (refreshResult.success && refreshResult.data) {
          setRules(refreshResult.data.data);
        }
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
        description: 'Failed to activate rules',
        variant: 'destructive',
      });
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedRules.length === 0) return;

    setIsBulkLoading(true);
    try {
      const result = await bulkUpdateRewardRulesAction(selectedRules, 'deactivate');
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        setSelectedRules([]);
        router.refresh();
        // Refresh the list
        const refreshResult = await getRewardRulesAction();
        if (refreshResult.success && refreshResult.data) {
          setRules(refreshResult.data.data);
        }
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
        description: 'Failed to deactivate rules',
        variant: 'destructive',
      });
    } finally {
      setIsBulkLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reward Rules</h1>
          <p className="text-muted-foreground mt-1">
            Manage reward rules and configurations
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/rewards/rules/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Rule
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search rules..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="discount-percentage">Percentage</SelectItem>
            <SelectItem value="discount-fixed">Fixed Discount</SelectItem>
            <SelectItem value="free-item">Free Item</SelectItem>
            <SelectItem value="loyalty-points">Loyalty Points</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedRules.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedRules.length} rule(s) selected
          </span>
          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkActivate}
              disabled={isBulkLoading}
            >
              {isBulkLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Power className="mr-2 h-4 w-4" />
              )}
              Activate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDeactivate}
              disabled={isBulkLoading}
            >
              {isBulkLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PowerOff className="mr-2 h-4 w-4" />
              )}
              Deactivate
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <RewardRuleTable
          rules={filteredRules}
          selectedRules={selectedRules}
          onSelectionChange={setSelectedRules}
        />
      )}

      {/* Results count */}
      {!isLoading && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredRules.length} of {rules.length} rule(s)
        </div>
      )}
    </div>
  );
}
