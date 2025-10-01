
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { id as indonesiaLocale } from 'date-fns/locale';

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  presetRanges: { label: string; range: DateRange }[];
}

export function DateRangePicker({
  className,
  date,
  setDate,
  presetRanges,
}: DateRangePickerProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal sm:w-[300px]',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'd MMM yyyy', { locale: indonesiaLocale })} -{' '}
                  {format(date.to, 'd MMM yyyy', { locale: indonesiaLocale })}
                </>
              ) : (
                format(date.from, 'd MMM yyyy', { locale: indonesiaLocale })
              )
            ) : (
              <span>Pilih tanggal</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="flex flex-col space-y-2 p-2 sm:flex-row sm:space-x-2 sm:space-y-0">
            {presetRanges.map(({ label, range }) => (
              <Button
                key={label}
                variant="ghost"
                onClick={() => setDate(range)}
              >
                {label}
              </Button>
            ))}
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            locale={indonesiaLocale}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
