import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { TabService } from '@/services';
import { MainLayout } from '@/components/shared/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Receipt, Plus, CreditCard } from 'lucide-react';
import Link from 'next/link';

async function getCustomerTabs() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.isLoggedIn) {
    redirect('/auth/login');
  }

  let tabs = [];

  if (session.userId) {
    // Get user's open tabs by userId
    tabs = await TabService.listOpenTabs({ userId: session.userId });
  } else if (session.isGuest && session.email) {
    // Get guest's open tabs by email
    tabs = await TabService.listOpenTabs({ customerEmail: session.email });
  } else {
    // Should not happen if isLoggedIn is true but just in case
    redirect('/auth/login');
  }

  // Serialize tabs for client component
  const serializedTabs = tabs.map((tab) => ({
    _id: tab._id.toString(),
    tabNumber: tab.tabNumber,
    tableNumber: tab.tableNumber,
    status: tab.status,
    orders: tab.orders.map((order: any) => order.toString()),
    subtotal: tab.subtotal,
    serviceFee: tab.serviceFee,
    tax: tab.tax,
    deliveryFee: tab.deliveryFee,
    discountTotal: tab.discountTotal,
    tipAmount: tab.tipAmount,
    total: tab.total,
    paymentStatus: tab.paymentStatus,
    openedAt: tab.openedAt.toISOString(),
  }));

  return { tabs: serializedTabs, userId: session.userId };
}

export default async function CustomerTabsPage() {
  const { tabs } = await getCustomerTabs();

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Tabs</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your open tabs
          </p>
        </div>

        {tabs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Open Tabs</h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                You don't have any open tabs at the moment. Start a new order to open a tab.
              </p>
              <Link href="/menu">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Browse Menu
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tabs.map((tab) => (
              <Card key={tab._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Table {tab.tableNumber}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tab #{tab.tabNumber}
                      </p>
                    </div>
                    <Badge variant={tab.status === 'open' ? 'default' : 'secondary'}>
                      {tab.status === 'open' ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Orders:</span>
                      <span className="font-medium">{tab.orders.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-semibold">₦{tab.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment:</span>
                      <Badge
                        variant={tab.paymentStatus === 'paid' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {tab.paymentStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Opened:</span>
                      <span className="text-xs">
                        {new Date(tab.openedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/orders/tabs/${tab._id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Receipt className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                    {tab.status === 'open' && (
                      <Link href={`/orders/tabs/${tab._id}/checkout`}>
                        <Button size="icon" variant="default">
                          <CreditCard className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>

                  {tab.status === 'open' && (
                    <Link href="/menu" className="block">
                      <Button variant="ghost" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Order to Tab
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
