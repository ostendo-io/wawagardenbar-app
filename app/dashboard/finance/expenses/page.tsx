import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { ExpensesPageClient } from '@/app/dashboard/finance/expenses/expenses-client';

export const metadata = {
  title: 'Expenses | Wawa Garden Bar',
  description: 'Manage business expenses',
};

async function getSession() {
  return await getIronSession<SessionData>(await cookies(), sessionOptions);
}

export default async function ExpensesPage() {
  const session = await getSession();

  // Check authentication
  if (!session.isLoggedIn) {
    redirect('/login');
  }

  // Check authorization - only super-admin and admin can access
  if (session.role !== 'super-admin' && session.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground">
            Track and manage your business expenses
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ExpensesPageClient userRole={session.role} />
      </Suspense>
    </div>
  );
}
