'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Percent, DollarSign, Gift, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { IRewardRule } from '@/interfaces';

/**
 * Form validation schema
 */
const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  isActive: z.boolean(),
  spendThreshold: z.coerce.number().min(0, 'Must be 0 or greater'),
  rewardType: z.enum(['discount-percentage', 'discount-fixed', 'free-item', 'loyalty-points']),
  rewardValue: z.coerce.number().positive('Must be positive'),
  freeItemId: z.string().nullable().optional(),
  probability: z.coerce.number().min(0).max(100),
  maxRedemptionsPerUser: z.coerce.number().int().positive().nullable().optional(),
  validityDays: z.coerce.number().int().positive('Must be positive'),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

type FormData = z.infer<typeof formSchema>;

/**
 * Reward type options with metadata
 */
const rewardTypes = [
  {
    value: 'discount-percentage',
    label: 'Discount Percentage',
    icon: Percent,
    description: 'X% off next order',
    valueLabel: 'Percentage (%)',
    valueMin: 1,
    valueMax: 100,
    placeholder: '10',
  },
  {
    value: 'discount-fixed',
    label: 'Fixed Discount',
    icon: DollarSign,
    description: '₦X off next order',
    valueLabel: 'Amount (₦)',
    valueMin: 100,
    valueMax: 50000,
    placeholder: '1000',
  },
  {
    value: 'free-item',
    label: 'Free Item',
    icon: Gift,
    description: 'Free menu item',
    valueLabel: 'Menu Item',
    requiresItemSelection: true,
    placeholder: 'Select item',
  },
  {
    value: 'loyalty-points',
    label: 'Loyalty Points',
    icon: Star,
    description: 'Points that convert to cash (100 pts = ₦1)',
    valueLabel: 'Points',
    valueMin: 100,
    valueMax: 10000,
    placeholder: '500',
  },
] as const;

interface RewardRuleFormProps {
  initialData?: Partial<IRewardRule>;
  onSubmit: (data: FormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

/**
 * Reward rule form component
 */
export function RewardRuleForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = 'Create Rule',
}: RewardRuleFormProps) {
  const { toast } = useToast();
  const [probabilityValue, setProbabilityValue] = useState(
    initialData?.probability ? initialData.probability * 100 : 30
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      isActive: initialData?.isActive ?? true,
      spendThreshold: initialData?.spendThreshold || 0,
      rewardType: initialData?.rewardType || 'discount-percentage',
      rewardValue: initialData?.rewardValue || 10,
      freeItemId: initialData?.freeItemId?.toString() || null,
      probability: initialData?.probability ? initialData.probability * 100 : 30,
      maxRedemptionsPerUser: initialData?.maxRedemptionsPerUser || null,
      validityDays: initialData?.validityDays || 30,
      startDate: initialData?.startDate
        ? new Date(initialData.startDate).toISOString().split('T')[0]
        : null,
      endDate: initialData?.endDate
        ? new Date(initialData.endDate).toISOString().split('T')[0]
        : null,
    },
  });

  const rewardType = watch('rewardType');
  const isActive = watch('isActive');
  const selectedType = rewardTypes.find((t) => t.value === rewardType);

  // Update probability value when slider changes
  useEffect(() => {
    setValue('probability', probabilityValue);
  }, [probabilityValue, setValue]);

  const handleFormSubmit = async (data: FormData) => {
    try {
      // Convert probability from percentage to decimal
      const submitData = {
        ...data,
        probability: data.probability / 100,
        maxRedemptionsPerUser: data.maxRedemptionsPerUser || undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
      };

      await onSubmit(submitData as any);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit form',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>General details about the reward rule</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Weekend Special 20% Off"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe when and how this reward is applied..."
              rows={3}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Active (rule will be applied to eligible orders)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Spend Threshold */}
      <Card>
        <CardHeader>
          <CardTitle>Spend Threshold</CardTitle>
          <CardDescription>Minimum order amount to qualify for this reward</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="spendThreshold">Minimum Spend (₦) *</Label>
            <Input
              id="spendThreshold"
              type="number"
              min="0"
              step="100"
              placeholder="5000"
              {...register('spendThreshold')}
            />
            {errors.spendThreshold && (
              <p className="text-sm text-red-600">{errors.spendThreshold.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Set to 0 for no minimum spend requirement
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reward Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Reward Configuration</CardTitle>
          <CardDescription>Type and value of the reward</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rewardType">Reward Type *</Label>
            <Select
              value={rewardType}
              onValueChange={(value: string) => setValue('rewardType', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rewardTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {type.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {selectedType && !('requiresItemSelection' in selectedType) && (
            <div className="space-y-2">
              <Label htmlFor="rewardValue">{selectedType.valueLabel} *</Label>
              <Input
                id="rewardValue"
                type="number"
                min={'valueMin' in selectedType ? selectedType.valueMin : undefined}
                max={'valueMax' in selectedType ? selectedType.valueMax : undefined}
                placeholder={selectedType.placeholder}
                {...register('rewardValue')}
              />
              {errors.rewardValue && (
                <p className="text-sm text-red-600">{errors.rewardValue.message}</p>
              )}
            </div>
          )}

          {selectedType && 'requiresItemSelection' in selectedType && selectedType.requiresItemSelection && (
            <div className="space-y-2">
              <Label htmlFor="freeItemId">Free Menu Item *</Label>
              <Input
                id="freeItemId"
                placeholder="Menu item ID (to be replaced with selector)"
                {...register('freeItemId')}
              />
              {errors.freeItemId && (
                <p className="text-sm text-red-600">{errors.freeItemId.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Note: Menu item selector to be implemented
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Probability & Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Probability & Limits</CardTitle>
          <CardDescription>Control how often this reward is issued</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Probability *</Label>
              <span className="text-2xl font-bold text-primary">
                {probabilityValue}%
              </span>
            </div>
            <Slider
              value={[probabilityValue]}
              onValueChange={(value) => setProbabilityValue(value[0])}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Chance of receiving this reward when eligible (0% = never, 100% = always)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxRedemptionsPerUser">
              Max Redemptions Per User (Optional)
            </Label>
            <Input
              id="maxRedemptionsPerUser"
              type="number"
              min="1"
              placeholder="Unlimited"
              {...register('maxRedemptionsPerUser')}
            />
            {errors.maxRedemptionsPerUser && (
              <p className="text-sm text-red-600">
                {errors.maxRedemptionsPerUser.message}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Leave empty for unlimited redemptions
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="validityDays">Validity Period (Days) *</Label>
            <Input
              id="validityDays"
              type="number"
              min="1"
              placeholder="30"
              {...register('validityDays')}
            />
            {errors.validityDays && (
              <p className="text-sm text-red-600">{errors.validityDays.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Number of days until the reward expires after being issued
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Schedule (Optional)</CardTitle>
          <CardDescription>
            Set start and end dates for time-limited campaigns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
              />
              {errors.startDate && (
                <p className="text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                {...register('endDate')}
              />
              {errors.endDate && (
                <p className="text-sm text-red-600">{errors.endDate.message}</p>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Leave empty for permanent rules. End date must be after start date.
          </p>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
