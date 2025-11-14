import { Metadata } from 'next';
import { MainLayout } from '@/components/shared/layout';
import { Container } from '@/components/shared/layout';
import { PageHeader } from '@/components/shared/ui';
import { EmptyState } from '@/components/shared/ui';
import { ShoppingBag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'My Orders - Wawa Garden Bar',
  description: 'View your order history',
};

export default function OrdersPage() {
  return (
    <MainLayout>
      <Container size="lg" className="py-8">
        <PageHeader
          title="My Orders"
          description="View and track your order history"
        />

        <div className="mt-8">
          <EmptyState
            icon={ShoppingBag}
            title="No orders yet"
            description="You haven't placed any orders. Start by browsing our menu!"
            action={{
              label: 'Browse Menu',
              onClick: () => {
                window.location.href = '/menu';
              },
            }}
          />
        </div>
      </Container>
    </MainLayout>
  );
}
