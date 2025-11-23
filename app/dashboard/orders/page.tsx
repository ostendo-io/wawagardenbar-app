import { Suspense } from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth-middleware';
import { getOrdersAction } from '@/app/actions/admin/order-management-actions';
import { OrderQueue } from '@/components/features/admin/order-queue';
import { OrderStats } from '@/components/features/admin/order-stats';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChefHat, BarChart3, Receipt } from 'lucide-react';

/**
 * Loading skeletons
 */
function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="mt-2 h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function QueueSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Orders dashboard page
 * Main order management interface
 */
export default async function OrdersPage() {
  await requireAdmin();

  const result = await getOrdersAction({}, 1, 50);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and track all restaurant orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/orders/analytics">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </Link>
          <Link href="/dashboard/orders/tabs">
            <Button variant="outline">
              <Receipt className="h-4 w-4 mr-2" />
              Tabs Display
            </Button>
          </Link>
          <Link href="/dashboard/kitchen">
            <Button>
              <ChefHat className="h-4 w-4 mr-2" />
              Kitchen Display
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <Suspense fallback={<StatsSkeleton />}>
        <OrderStats />
      </Suspense>

      {/* Order Queue */}
      <Suspense fallback={<QueueSkeleton />}>
        <OrderQueue initialOrders={(result.data as any)?.orders || []} />
      </Suspense>
    </div>
  );
}
