'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { IUser } from '@/interfaces';

interface ProfileCompletionCardProps {
  profile: IUser;
}

/**
 * Profile completion progress card
 */
export function ProfileCompletionCard({ profile }: ProfileCompletionCardProps) {
  const completion = profile.profileCompletionPercentage || 0;
  
  // Determine missing fields (must match calculation in user model)
  const missingFields: string[] = [];
  if (!profile.firstName) missingFields.push('First name');
  if (!profile.lastName) missingFields.push('Last name');
  if (!profile.phone) missingFields.push('Phone number');
  if (!profile.email || !profile.emailVerified) missingFields.push('Email verification');

  // Don't show if profile is complete OR no missing fields
  if (completion === 100 || missingFields.length === 0) {
    return (
      <Card className="bg-green-50 border-green-200 mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Profile Complete!</p>
              <p className="text-sm text-green-700">
                Your profile is 100% complete. You're all set!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-blue-50 border-blue-200 mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">
                  Complete Your Profile
                </p>
                <p className="text-sm text-blue-700">
                  {completion}% complete • Add missing information to unlock benefits
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-900">
              {completion}%
            </Badge>
          </div>

          {/* Progress Bar */}
          <Progress value={completion} className="h-2" />

          {/* Missing Fields */}
          {missingFields.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-blue-700">Missing:</span>
              {missingFields.map((field) => (
                <Badge
                  key={field}
                  variant="outline"
                  className="border-blue-300 text-blue-700"
                >
                  {field}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
