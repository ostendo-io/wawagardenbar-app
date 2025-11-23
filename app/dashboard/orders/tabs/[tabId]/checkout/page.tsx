import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { TabService } from '@/services';

interface DashboardTabCheckoutPageProps {
  params: Promise<{
    tabId: string;
  }>;
}

async function getTabForCheckout(tabId: string) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.userId || (session.role !== 'admin' && session.role !== 'super-admin')) {
    redirect('/dashboard');
  }

  const tab = await TabService.getTabById(tabId);

  if (!tab) {
    redirect('/dashboard/orders/tabs');
  }

  if (tab.status === 'closed') {
    redirect(`/dashboard/orders/tabs/${tabId}`);
  }

  return { tab: JSON.parse(JSON.stringify(tab)), session };
}

/**
 * Dashboard tab checkout page
 * Redirects to customer checkout flow for payment processing
 */
export default async function DashboardTabCheckoutPage({ params }: DashboardTabCheckoutPageProps) {
  const { tabId } = await params;
  await getTabForCheckout(tabId);

  // Redirect to customer checkout page
  // This allows admin to use the same payment flow as customers
  redirect(`/orders/tabs/${tabId}/checkout`);
}
