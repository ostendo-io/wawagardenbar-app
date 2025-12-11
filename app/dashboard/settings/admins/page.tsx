import { Suspense } from 'react';
import { requireSuperAdmin } from '@/lib/auth-middleware';
import { AdminList } from '@/components/features/admin/admin-list';
import { CreateAdminDialog } from '@/components/features/admin/create-admin-dialog';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

export const metadata = {
  title: 'Manage Admins | Admin Dashboard',
  description: 'Manage admin users and permissions',
};

export default async function ManageAdminsPage() {
  await requireSuperAdmin();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Admins</h1>
          <p className="text-muted-foreground">
            Create and manage admin user accounts
          </p>
        </div>
        <CreateAdminDialog>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Create Admin
          </Button>
        </CreateAdminDialog>
      </div>

      {/* Admin List */}
      <Suspense fallback={<div>Loading admins...</div>}>
        <AdminList />
      </Suspense>
    </div>
  );
}
