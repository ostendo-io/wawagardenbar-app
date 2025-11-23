'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';

interface TabsFilterProps {
  onFilterChange: (filters: {
    statuses: string[];
    dateRange?: DateRange;
  }) => void;
}

const TAB_STATUSES = [
  { value: 'open', label: 'Open', description: 'Currently active tabs' },
  { value: 'settling', label: 'Settling', description: 'Payment in progress' },
  { value: 'closed', label: 'Closed', description: 'Completed tabs' },
];

/**
 * Tabs filter component with status checkboxes and date range picker
 */
export function TabsFilter({ onFilterChange }: TabsFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['open']);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatuses = checked
      ? [...selectedStatuses, status]
      : selectedStatuses.filter((s) => s !== status);
    
    setSelectedStatuses(newStatuses);
    onFilterChange({ statuses: newStatuses, dateRange });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    onFilterChange({ statuses: selectedStatuses, dateRange: range });
  };

  const handleClearFilters = () => {
    setSelectedStatuses(['open']);
    setDateRange(undefined);
    onFilterChange({ statuses: ['open'], dateRange: undefined });
  };

  const activeFilterCount = 
    (selectedStatuses.length > 0 ? 1 : 0) + 
    (dateRange?.from ? 1 : 0);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                  <CardTitle className="flex items-center gap-2 cursor-pointer">
                    <Filter className="h-4 w-4" />
                    Filter Tabs
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </CardTitle>
                </Button>
              </CollapsibleTrigger>
            </div>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 px-2"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
          <CardDescription>
            Filter tabs by status and date range
          </CardDescription>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Status Filters */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Tab Status</Label>
              <div className="space-y-3">
                {TAB_STATUSES.map((status) => (
                  <div key={status.value} className="flex items-start space-x-3">
                    <Checkbox
                      id={`status-${status.value}`}
                      checked={selectedStatuses.includes(status.value)}
                      onCheckedChange={(checked) =>
                        handleStatusChange(status.value, checked as boolean)
                      }
                    />
                    <div className="grid gap-1 leading-none">
                      <label
                        htmlFor={`status-${status.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {status.label}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {status.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Date Range</Label>
              <DateRangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                placeholder="Select date range"
                maxDate={new Date()}
              />
              <p className="text-xs text-muted-foreground">
                Filter tabs by when they were opened
              </p>
            </div>

            {/* Active Filters Summary */}
            {activeFilterCount > 0 && (
              <div className="pt-3 border-t">
                <p className="text-sm font-medium mb-2">Active Filters:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedStatuses.length > 0 && (
                    <Badge variant="secondary">
                      Status: {selectedStatuses.map((s) => 
                        TAB_STATUSES.find((ts) => ts.value === s)?.label
                      ).join(', ')}
                    </Badge>
                  )}
                  {dateRange?.from && (
                    <Badge variant="secondary">
                      {dateRange.to
                        ? `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`
                        : format(dateRange.from, 'MMM dd')}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
