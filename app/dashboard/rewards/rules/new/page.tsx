'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RewardRuleForm } from '@/components/features/admin/rewards';
import { createRewardRuleAction } from '@/app/actions/admin/reward-rules-actions';

/**
 * Create new reward rule page
 */
export default function NewRewardRulePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const result = await createRewardRuleAction(data);

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        router.push('/dashboard/rewards/rules');
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
        description: error instanceof Error ? error.message : 'Failed to create reward rule',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/rewards/rules">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Reward Rule</h1>
          <p className="text-muted-foreground mt-1">
            Configure a new reward rule for your customers
          </p>
        </div>
      </div>

      {/* Form */}
      <RewardRuleForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel="Create Rule"
      />
    </div>
  );
}
