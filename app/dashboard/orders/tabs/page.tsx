import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { TabService } from '@/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Receipt, Eye, CreditCard } from 'lucide-react';
import Link from 'next/link';

async function getOpenTabs() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.userId || (session.role !== 'admin' && session.role !== 'super-admin')) {
    redirect('/dashboard');
  }

  const tabs = await TabService.listOpenTabs();

  // Fully serialize tabs to plain objects
  const serializedTabs = JSON.parse(JSON.stringify(tabs)).map((tab: any) => ({
    _id: tab._id,
    tabNumber: tab.tabNumber,
    tableNumber: tab.tableNumber,
    status: tab.status,
    orders: Array.isArray(tab.orders) ? tab.orders : [],
    subtotal: tab.subtotal,
    serviceFee: tab.serviceFee,
    tax: tab.tax,
    deliveryFee: tab.deliveryFee,
    discountTotal: tab.discountTotal,
    tipAmount: tab.tipAmount,
    total: tab.total,
    paymentStatus: tab.paymentStatus,
    openedAt: tab.openedAt,
  }));

  return { tabs: serializedTabs };
}

export default async function DashboardTabsPage() {
  const { tabs } = await getOpenTabs();

  const totalTabsAmount = tabs.reduce((sum, tab) => sum + tab.total, 0);
  const totalOrders = tabs.reduce((sum, tab) => sum + tab.orders.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Open Tabs</h1>
        <p className="text-muted-foreground mt-2">
          Manage all open tabs across all tables
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tabs</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tabs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalTabsAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs List */}
      {tabs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Open Tabs</h3>
            <p className="text-sm text-muted-foreground text-center">
              There are currently no open tabs in the system
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Open Tabs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tabs.map((tab) => (
                <div
                  key={tab._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">Table {tab.tableNumber}</h3>
                      <Badge variant="outline">Tab #{tab.tabNumber}</Badge>
                      <Badge variant={tab.status === 'open' ? 'default' : 'secondary'}>
                        {tab.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{tab.orders.length} order(s)</span>
                      <span>•</span>
                      <span>Opened {new Date(tab.openedAt).toLocaleString()}</span>
                      <span>•</span>
                      <span className="font-semibold text-foreground">
                        ₦{tab.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/orders/tabs/${tab._id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
