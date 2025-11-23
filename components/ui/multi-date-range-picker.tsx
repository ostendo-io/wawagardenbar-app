'use client';

import * as React from 'react';
import { CalendarIcon, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface MultiDateRangePickerProps {
  value?: DateRange[];
  onChange?: (ranges: DateRange[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

/**
 * Multi-date range picker component
 * Allows selection of multiple non-contiguous date ranges
 */
export function MultiDateRangePicker({
  value = [],
  onChange,
  placeholder = 'Select dates',
  className,
  disabled = false,
  minDate,
  maxDate,
}: MultiDateRangePickerProps) {
  const [ranges, setRanges] = React.useState<DateRange[]>(value);
  const [currentRange, setCurrentRange] = React.useState<DateRange | undefined>();
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setRanges(value);
  }, [value]);

  const handleSelect = (range: DateRange | undefined) => {
    if (!range) {
      setCurrentRange(undefined);
      return;
    }

    // If both from and to are selected, add to ranges
    if (range.from && range.to) {
      const newRanges = [...ranges, range];
      setRanges(newRanges);
      onChange?.(newRanges);
      setCurrentRange(undefined);
    } else {
      // Still selecting the range
      setCurrentRange(range);
    }
  };

  const removeRange = (index: number) => {
    const newRanges = ranges.filter((_, i) => i !== index);
    setRanges(newRanges);
    onChange?.(newRanges);
  };

  const clearAll = () => {
    setRanges([]);
    setCurrentRange(undefined);
    onChange?.([]);
  };

  const formatDateRange = (range: DateRange) => {
    const { from, to } = range;
    
    if (from && to) {
      // Check if same day
      if (from.toDateString() === to.toDateString()) {
        return format(from, 'MMM dd');
      }
      // Check if same month
      if (from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()) {
        return `${format(from, 'MMM dd')}-${format(to, 'dd')}`;
      }
      return `${format(from, 'MMM dd')} - ${format(to, 'MMM dd')}`;
    }
    
    if (from) {
      return format(from, 'MMM dd');
    }
    
    return '';
  };

  // Get all selected dates for highlighting
  const getSelectedDates = () => {
    const dates: Date[] = [];
    
    ranges.forEach((range) => {
      if (range.from && range.to) {
        const current = new Date(range.from);
        while (current <= range.to) {
          dates.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
      } else if (range.from) {
        dates.push(range.from);
      }
    });
    
    return dates;
  };

  const selectedDates = getSelectedDates();

  return (
    <div className="space-y-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              ranges.length === 0 && !currentRange && 'text-muted-foreground',
              className
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {ranges.length > 0 ? `${ranges.length} date range(s) selected` : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {currentRange?.from && !currentRange?.to
                  ? 'Select end date'
                  : 'Select date range'}
              </p>
              {(ranges.length > 0 || currentRange) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="h-8 px-2 text-xs"
                >
                  Clear All
                </Button>
              )}
            </div>
            
            <Calendar
              mode="range"
              selected={currentRange}
              onSelect={handleSelect}
              numberOfMonths={2}
              disabled={(date) => {
                if (minDate && date < minDate) return true;
                if (maxDate && date > maxDate) return true;
                return false;
              }}
              modifiers={{
                selected: selectedDates,
              }}
              modifiersClassNames={{
                selected: 'bg-primary/20 text-primary',
              }}
              initialFocus
            />
            
            {currentRange?.from && !currentRange?.to && (
              <p className="text-xs text-muted-foreground px-3">
                Click another date to complete the range
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Display selected ranges */}
      {ranges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ranges.map((range, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="pl-2 pr-1 py-1 text-xs"
            >
              {formatDateRange(range)}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => removeRange(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
