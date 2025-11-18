'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RewardRuleForm } from '@/components/features/admin/rewards';
import { IRewardRule } from '@/interfaces';
import {
  getRewardRuleByIdAction,
  updateRewardRuleAction,
} from '@/app/actions/admin/reward-rules-actions';

interface EditRewardRulePageProps {
  params: Promise<{ id: string }>;
}

/**
 * Edit reward rule page
 */
export default function EditRewardRulePage({ params }: EditRewardRulePageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [rule, setRule] = useState<IRewardRule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ruleId, setRuleId] = useState<string | null>(null);

  // Unwrap params
  useEffect(() => {
    params.then((p) => setRuleId(p.id));
  }, [params]);

  // Fetch rule data
  useEffect(() => {
    if (!ruleId) return;

    async function fetchRule() {
      setIsLoading(true);
      try {
        const result = await getRewardRuleByIdAction(ruleId!);

        if (result.success && result.data) {
          setRule(result.data);
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to load reward rule',
            variant: 'destructive',
          });
          router.push('/dashboard/rewards/rules');
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load reward rule',
          variant: 'destructive',
        });
        router.push('/dashboard/rewards/rules');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRule();
  }, [ruleId, router, toast]);

  const handleSubmit = async (data: any) => {
    if (!ruleId) return;

    setIsSubmitting(true);
    try {
      const result = await updateRewardRuleAction(ruleId, data);

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
        description: error instanceof Error ? error.message : 'Failed to update reward rule',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!rule) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Reward rule not found</p>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Edit Reward Rule</h1>
          <p className="text-muted-foreground mt-1">
            Update the configuration for &quot;{rule.name}&quot;
          </p>
        </div>
      </div>

      {/* Form */}
      <RewardRuleForm
        initialData={rule}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitLabel="Update Rule"
      />
    </div>
  );
}
