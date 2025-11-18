'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Percent, DollarSign, Gift, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { createRewardRuleAction } from '@/app/actions/admin/reward-rules-actions';

/**
 * Pre-configured reward templates
 */
const templates = [
  {
    id: 'first-order',
    name: 'First Order 10% Off',
    description: 'Welcome new customers with 10% off their first order',
    icon: Percent,
    color: 'text-blue-600',
    config: {
      spendThreshold: 0,
      rewardType: 'discount-percentage',
      rewardValue: 10,
      probability: 100,
      validityDays: 30,
    },
  },
  {
    id: 'high-spender',
    name: 'High Spender ₦500 Off',
    description: 'Reward customers who spend ₦5,000 or more',
    icon: DollarSign,
    color: 'text-green-600',
    config: {
      spendThreshold: 5000,
      rewardType: 'discount-fixed',
      rewardValue: 500,
      probability: 50,
      validityDays: 30,
    },
  },
  {
    id: 'loyalty-points',
    name: 'Loyalty Points Bonus',
    description: 'Give 500 points for orders over ₦3,000',
    icon: Star,
    color: 'text-orange-600',
    config: {
      spendThreshold: 3000,
      rewardType: 'loyalty-points',
      rewardValue: 500,
      probability: 30,
      validityDays: 90,
    },
  },
  {
    id: 'free-dessert',
    name: 'Free Dessert',
    description: 'Free dessert for orders over ₦4,000',
    icon: Gift,
    color: 'text-purple-600',
    config: {
      spendThreshold: 4000,
      rewardType: 'free-item',
      rewardValue: 0,
      probability: 20,
      validityDays: 14,
    },
  },
  {
    id: 'weekend-special',
    name: 'Weekend 15% Off',
    description: '15% off for weekend orders over ₦2,000',
    icon: Percent,
    color: 'text-pink-600',
    config: {
      spendThreshold: 2000,
      rewardType: 'discount-percentage',
      rewardValue: 15,
      probability: 40,
      validityDays: 7,
    },
  },
];

/**
 * Reward templates page
 */
export default function RewardTemplatesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null);

  const handleUseTemplate = async (template: typeof templates[0]) => {
    setLoadingTemplate(template.id);
    try {
      // Check if it's a free-item template
      if (template.config.rewardType === 'free-item') {
        toast({
          title: 'Template Not Available',
          description: 'Free item templates require selecting a specific menu item. Please create this rule manually.',
          variant: 'destructive',
        });
        setLoadingTemplate(null);
        return;
      }

      const ruleData = {
        name: template.name,
        description: template.description,
        isActive: true,
        spendThreshold: template.config.spendThreshold,
        rewardType: template.config.rewardType as any,
        rewardValue: template.config.rewardValue,
        probability: template.config.probability / 100, // Convert percentage to decimal
        validityDays: template.config.validityDays,
      };

      const result = await createRewardRuleAction(ruleData);

      if (result.success) {
        toast({
          title: 'Success',
          description: `Template "${template.name}" applied successfully!`,
        });
        router.push('/dashboard/rewards/rules');
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to apply template',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to apply template',
        variant: 'destructive',
      });
    } finally {
      setLoadingTemplate(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/rewards">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reward Templates</h1>
          <p className="text-muted-foreground mt-1">
            Quick-start templates for common reward scenarios
          </p>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Icon className={`h-8 w-8 ${template.color}`} />
                  <Badge variant="outline">Template</Badge>
                </div>
                <CardTitle className="mt-4">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Threshold:</span>
                    <span className="font-medium">
                      {template.config.spendThreshold === 0
                        ? 'No minimum'
                        : `₦${template.config.spendThreshold.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Value:</span>
                    <span className="font-medium">
                      {template.config.rewardType === 'discount-percentage'
                        ? `${template.config.rewardValue}%`
                        : template.config.rewardType === 'discount-fixed'
                        ? `₦${template.config.rewardValue}`
                        : template.config.rewardType === 'loyalty-points'
                        ? `${template.config.rewardValue} pts`
                        : 'Free Item'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Probability:</span>
                    <span className="font-medium">{template.config.probability}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Validity:</span>
                    <span className="font-medium">{template.config.validityDays} days</span>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleUseTemplate(template)}
                  disabled={loadingTemplate !== null}
                  variant={template.config.rewardType === 'free-item' ? 'outline' : 'default'}
                >
                  {loadingTemplate === template.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : template.config.rewardType === 'free-item' ? (
                    'Requires Manual Setup'
                  ) : (
                    'Use Template'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Note */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Tip:</strong> Click "Use Template" to instantly create a reward rule based on the template.
            </p>
            <p>
              <strong>Note:</strong> Free item templates require manual setup to select a specific menu item.
              Create these rules manually via the{' '}
              <Link href="/dashboard/rewards/rules/new" className="text-primary hover:underline">
                Create Rule
              </Link>{' '}
              page.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
