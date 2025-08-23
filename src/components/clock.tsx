
'use client';

import { useState, useEffect } from 'react';

export function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // This effect runs only on the client, after hydration
    setTime(new Date());
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };
    // Indonesian locale
    return new Intl.DateTimeFormat('id-ID', options).format(date);
  };

  const formatTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    return new Intl.DateTimeFormat('id-ID', options).format(date).replace(/\./g, ':');
  };

  if (time === null) {
    return (
       <div className="bg-primary text-primary-foreground rounded-lg px-4 py-1 text-center min-w-[130px]">
        <div className="text-xs font-medium">Memuat...</div>
        <div className="text-base font-bold tracking-wider">--:--:--</div>
      </div>
    )
  }

  return (
    <div className="bg-primary text-primary-foreground rounded-lg px-4 py-1 text-center min-w-[130px]">
      <div className="text-xs font-medium">{formatDate(time)}</div>
      <div className="text-base font-bold tracking-wider">{formatTime(time)}</div>
    </div>
  );
}
