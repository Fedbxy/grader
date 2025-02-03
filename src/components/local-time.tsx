"use client";

export function LocalTime({ date }: { date: string }) {
    return <time dateTime={date}>{new Date(date).toLocaleString()}</time>;
}