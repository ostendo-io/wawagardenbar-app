import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { MainLayout } from '@/components/shared/layout';
import { Container } from '@/components/shared/layout';
import { PageHeader } from '@/components/shared/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Award, TrendingUp, LogIn } from 'lucide-react';
import { sessionOptions, SessionData } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Rewards - Wawa Garden Bar',
  description: 'View your rewards and loyalty points',
};

export default async function RewardsPage() {
  // Check if user is authenticated
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  // If authenticated, redirect to profile rewards page
  if (session.userId) {
    redirect('/profile/rewards');
  }

  // Show login prompt for guests
  return (
    <MainLayout>
      <Container size="lg" className="py-8">
        <PageHeader
          title="Rewards"
          description="Track your loyalty points and redeem rewards"
        />

        <div className="mt-8 space-y-6">
          {/* Login Required Card */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Gift className="h-6 w-6 text-primary" />
                <CardTitle>Sign In to View Your Rewards</CardTitle>
              </div>
              <CardDescription>
                Access your active rewards, track your savings, and manage loyalty points
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Link href="/login?redirect=/profile/rewards" className="flex-1">
                  <Button className="w-full" size="lg">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In to View Rewards
                  </Button>
                </Link>
                <Link href="/register?redirect=/profile/rewards">
                  <Button variant="outline" size="lg">
                    Create Account
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                New to Wawa Garden Bar? Create an account to start earning rewards!
              </p>
            </CardContent>
          </Card>

          {/* Features Preview */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Active Rewards</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View and redeem your active discount rewards and free items
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">Track Savings</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  See how much you've saved with rewards and special offers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  <CardTitle className="text-lg">Loyalty Points</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Earn points with every order (100 points = ₦1 discount)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle>How Rewards Work</CardTitle>
              <CardDescription>
                Earn rewards automatically when you place orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Place orders and reach spending thresholds</li>
                <li>Receive random rewards (discounts, free items, loyalty points)</li>
                <li>View your rewards in your dashboard</li>
                <li>Apply rewards at checkout for instant savings</li>
                <li>Track your reward history and total savings</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </Container>
    </MainLayout>
  );
}
