import { MenuItemWithStock } from '@/services/category-service';
import { MenuItem } from './menu-item';
import { EmptyState } from '@/components/shared/ui';
import { UtensilsCrossed } from 'lucide-react';

interface MenuGridProps {
  items: MenuItemWithStock[];
  searchQuery?: string;
}

export function MenuGrid({ items, searchQuery }: MenuGridProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={UtensilsCrossed}
        title={searchQuery ? 'No items found' : 'No items available'}
        description={
          searchQuery
            ? `No menu items match "${searchQuery}". Try a different search.`
            : 'There are no items available in this category at the moment.'
        }
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <MenuItem key={item._id.toString()} item={item} />
      ))}
    </div>
  );
}
