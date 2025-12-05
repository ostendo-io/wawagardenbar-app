import { Suspense } from 'react';
import { requireSuperAdmin } from '@/lib/auth-middleware';
import { RequestsTable } from './requests-table';
import { getDeletionRequestsAction } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default async function DataRequestsPage() {
  await requireSuperAdmin();
  const result = await getDeletionRequestsAction();

  if (!result.success) {
    return (
        <div className="p-6">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Failed to load data requests.</AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Deletion Requests</h1>
        <p className="text-muted-foreground">
          Manage user requests for account deletion and data removal.
        </p>
      </div>

      <Suspense fallback={<div>Loading requests...</div>}>
        <RequestsTable requests={result.data as any} />
      </Suspense>
    </div>
  );
}
