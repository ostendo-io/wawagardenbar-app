import { Metadata } from 'next';
import { MainLayout } from '@/components/shared/layout';
import { Container } from '@/components/shared/layout';
import { PageHeader } from '@/components/shared/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Rewards - Wawa Garden Bar',
  description: 'View your rewards and loyalty points',
};

export default function RewardsPage() {
  return (
    <MainLayout>
      <Container size="lg" className="py-8">
        <PageHeader
          title="Rewards"
          description="Track your loyalty points and redeem rewards"
        />

        <div className="mt-8 space-y-6">
          {/* Coming Soon Card */}
          <Card className="border-dashed">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Gift className="h-6 w-6 text-primary" />
                <CardTitle>Rewards Program Coming Soon</CardTitle>
              </div>
              <CardDescription>
                Earn points with every order and redeem for discounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Points</span>
                  <Badge variant="secondary">0 points</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  The rewards system will be available in Phase 3: Order Management.
                  Start ordering now to earn points when the system launches!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preview of Rewards Tiers */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bronze</CardTitle>
                <CardDescription>0-999 points</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">5% off orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Silver</CardTitle>
                <CardDescription>1,000-4,999 points</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">10% off orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gold</CardTitle>
                <CardDescription>5,000+ points</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">15% off orders</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </MainLayout>
  );
}
