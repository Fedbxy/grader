"use client";

export function LocalTime({ date }: { date: string }) {
  return (
    <time dateTime={date} suppressHydrationWarning>
      {new Date(date).toLocaleString()}
    </time>
  );
}
