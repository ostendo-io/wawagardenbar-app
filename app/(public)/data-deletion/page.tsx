import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { redirect } from 'next/navigation';
import { sessionOptions, SessionData } from '@/lib/session';
import { ProfileService } from '@/services';
import { DataDeletionForm } from './data-deletion-form';

export const metadata = {
  title: 'Data Deletion Request | Wawa Garden Bar',
  description: 'Request permanent deletion of your account and data',
};

export default async function DataDeletionPage() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.isLoggedIn || !session.userId) {
    redirect('/login?redirect=/data-deletion');
  }

  // Get user profile to check for phone number if email is missing
  const profile = await ProfileService.getUserProfile(session.userId);

  // Determine identifier to pre-fill (Email > Phone)
  const identifier = profile?.email || profile?.phone || '';

  return <DataDeletionForm initialEmail={identifier} />;
}
