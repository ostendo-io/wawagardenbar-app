'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  Package,
  ShoppingCart,
  Gift,
  Settings,
  FileText,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserRole } from '@/interfaces/user.interface';
import { RoleBadge } from './role-badge';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'super-admin'],
  },
  {
    title: 'Orders',
    href: '/dashboard/orders',
    icon: ShoppingCart,
    roles: ['admin', 'super-admin'],
  },
  {
    title: 'Menu',
    href: '/dashboard/menu',
    icon: UtensilsCrossed,
    roles: ['super-admin'],
  },
  {
    title: 'Customers',
    href: '/dashboard/customers',
    icon: Users,
    roles: ['super-admin'],
  },
  {
    title: 'Inventory',
    href: '/dashboard/inventory',
    icon: Package,
    roles: ['super-admin'],
  },
  {
    title: 'Rewards',
    href: '/dashboard/rewards',
    icon: Gift,
    roles: ['super-admin'],
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    roles: ['super-admin'],
  },
  {
    title: 'Audit Logs',
    href: '/dashboard/audit-logs',
    icon: FileText,
    roles: ['super-admin'],
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    roles: ['super-admin'],
  },
];

interface DashboardNavProps {
  userEmail?: string;
  userRole?: UserRole;
}

/**
 * Dashboard sidebar navigation with role-based filtering
 * Only shows navigation items that the user has permission to access
 */
export function DashboardNav({ userEmail, userRole }: DashboardNavProps) {
  const pathname = usePathname();

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter((item) => {
    if (!userRole) return false;
    return item.roles.includes(userRole);
  });

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary" />
          <div>
            <h1 className="text-lg font-bold">Wawa Garden Bar</h1>
            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
                {item.badge && (
                  <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Info & Logout */}
      <div className="border-t p-4">
        <div className="mb-3 rounded-lg bg-muted p-3">
          <p className="text-sm font-medium truncate">
            {userEmail || 'Admin User'}
          </p>
          {userRole && (
            <div className="mt-2">
              <RoleBadge role={userRole} showIcon={true} />
            </div>
          )}
        </div>
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/api/auth/logout">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Link>
        </Button>
      </div>
    </div>
  );
}
