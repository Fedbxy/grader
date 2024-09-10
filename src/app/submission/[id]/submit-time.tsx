"use client";

export function SubmitTime({ date }: { date: string }) {
    return <span>{new Date(date).toLocaleString()}</span>;
}