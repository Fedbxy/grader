"use client";

export function LocalTime({ date }: { date: string }) {
    return <span>{new Date(date).toLocaleString()}</span>;
}