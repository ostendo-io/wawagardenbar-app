'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Receipt, Plus, CreditCard, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { TabsFilter } from './tabs-filter';
import { getFilteredTabsAction } from '@/app/actions/tabs/tab-actions';
import { useToast } from '@/hooks/use-toast';

interface Tab {
  _id: string;
  tabNumber: string;
  tableNumber: string;
  status: string;
  orders: string[];
  subtotal: number;
  serviceFee: number;
  tax: number;
  deliveryFee: number;
  discountTotal: number;
  tipAmount: number;
  total: number;
  paymentStatus: string;
  openedAt: string;
}

interface TabsListClientProps {
  initialTabs: Tab[];
}

/**
 * Client component for tabs list with filtering
 */
export function TabsListClient({ initialTabs }: TabsListClientProps) {
  const { toast } = useToast();
  const [tabs, setTabs] = useState<Tab[]>(initialTabs);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilterChange = async (filters: {
    statuses: string[];
    dateRange?: DateRange;
  }) => {
    setIsLoading(true);
    
    try {
      const result = await getFilteredTabsAction({
        statuses: filters.statuses.length > 0 ? filters.statuses : undefined,
        startDate: filters.dateRange?.from?.toISOString(),
        endDate: filters.dateRange?.to?.toISOString(),
      });

      if (result.success && result.data) {
        // Serialize tabs to match Tab interface
        const serializedTabs = result.data.tabs.map((tab: any) => ({
          _id: tab._id.toString(),
          tabNumber: tab.tabNumber,
          tableNumber: tab.tableNumber,
          status: tab.status,
          orders: Array.isArray(tab.orders) ? tab.orders.map((o: any) => o.toString()) : [],
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
        setTabs(serializedTabs);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to filter tabs',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to filter tabs',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      open: 'default',
      settling: 'secondary',
      closed: 'outline',
    };

    const labels: Record<string, string> = {
      open: 'Open',
      settling: 'Settling',
      closed: 'Closed',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      paid: 'default',
      failed: 'destructive',
    };

    const labels: Record<string, string> = {
      pending: 'Pending',
      paid: 'Paid',
      failed: 'Failed',
    };

    return (
      <Badge variant={variants[status] || 'secondary'} className="text-xs">
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <TabsFilter onFilterChange={handleFilterChange} />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Tabs List */}
      {!isLoading && tabs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Tabs Found</h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              No tabs match your current filters. Try adjusting your search criteria.
            </p>
            <Link href="/menu">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Browse Menu
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : !isLoading ? (
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
                  {getStatusBadge(tab.status)}
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
                    {getPaymentStatusBadge(tab.paymentStatus)}
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
      ) : null}
    </div>
  );
}
