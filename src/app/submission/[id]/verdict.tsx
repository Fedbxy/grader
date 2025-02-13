"use client";

import { maps } from "@/config/messages";
import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/local-storage";
import { useSubmission } from "@/hooks/submission";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

export function Verdict({ submissionId }: { submissionId: number }) {
  const [verdictStyle] = useLocalStorage("verdictStyle", "table");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (verdictStyle) {
      setIsLoading(false);
    }
  }, [verdictStyle]);

  const {
    data,
    isLoading: isSubmissionLoading,
    isRunning,
  } = useSubmission(submissionId);

  if (isLoading || isSubmissionLoading) {
    return <Skeleton className="h-96 rounded-md" />;
  }

  const { verdict, error, time, memory } = data;

  const isError = verdict.length === 1 && error;

  if (isRunning) {
    return (
      <pre className="flex items-center p-4">
        <LoadingSpinner className="mr-2 h-5 w-5" />
        {verdict[0]}
      </pre>
    );
  }

  if (isError) {
    return (
      <Popover>
        <PopoverTrigger>
          <pre className="p-4 text-destructive hover:underline">
            {
              maps.submission.verdict[
                verdict[0] as keyof typeof maps.submission.verdict
              ]
            }
          </pre>
        </PopoverTrigger>
        <PopoverContent className="w-full max-w-md overflow-x-auto md:max-w-xl">
          <pre className="text-destructive">{error}</pre>
        </PopoverContent>
      </Popover>
    );
  }

  const table = (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">#</TableHead>
          <TableHead>Verdict</TableHead>
          <TableHead className="text-nowrap text-right">Execution Time</TableHead>
          <TableHead className="text-nowrap text-right">Memory Used</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {verdict.map((v: string, i: number) => (
          <TableRow key={i}>
            <TableCell>{i + 1}</TableCell>
            <TableCell>
              <Badge
                variant={v === "AC" ? "constructive" : "destructive"}
                className="capitalize"
              >
                {
                  maps.submission.verdict[
                    v as keyof typeof maps.submission.verdict
                  ]
                }
              </Badge>
            </TableCell>
            <TableCell className="text-right">{time[i]} ms</TableCell>
            <TableCell className="text-right">{memory[i]} KB</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const classic = (
    <div className="flex flex-col overflow-x-auto bg-secondary p-4">
      {verdict.map((v: string, i: number) => (
        <pre
          className={`${v === "AC" ? "text-constructive" : "text-destructive"}`}
          key={i}
        >
          #{i + 1}{" "}
          {maps.submission.verdict[v as keyof typeof maps.submission.verdict]} (
          {time[i]}ms, {memory[i]}KB)
        </pre>
      ))}
    </div>
  );

  return verdictStyle === "table" ? table : classic;
}
