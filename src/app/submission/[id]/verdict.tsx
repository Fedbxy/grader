"use client";

import { maps } from "@/config/messages";
import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/local-storage";
import { useSubmission } from "@/hooks/submission";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StyleSwitcher } from "./switcher";
import { LoadingSpinner } from "@/components/ui/spinner";

export function Verdict({ submissionId }: { submissionId: number }) {
  const [verdictStyle] = useLocalStorage("verdictStyle", "accordion");
  const [isLoading, setIsLoading] = useState(true);

  
  useEffect(() => {
    if (verdictStyle) {
      setIsLoading(false);
    }
  }, [verdictStyle]);
  
  const { data, isLoading: isSubmissionLoading, isRunning } = useSubmission(submissionId);

  if (isLoading || isSubmissionLoading) {
    return <Skeleton className="h-96 rounded-md" />;
  }

  const { verdict, error, time, memory } = data;

  const isError = verdict.length === 1 && error;

  const accordion = (
    <div className="relative rounded-md bg-secondary p-4">
      <div className="absolute right-2 top-2">
        <StyleSwitcher />
      </div>
      {isRunning ? (
        <pre className="flex items-center">
          <LoadingSpinner className="mr-2 h-5 w-5" />
          {verdict[0]}
        </pre>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          <Accordion type="multiple" className="space-y-2">
            {verdict.map((v: string, i: number) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className={`rounded-md px-4 text-xs ${v === "AC" ? "bg-constructive text-constructive-foreground" : "bg-destructive text-destructive-foreground"}`}
              >
                <AccordionTrigger>
                  {!error && `#${i + 1} `}
                  {
                    maps.submission.verdict[
                    v as keyof typeof maps.submission.verdict
                    ]
                  }
                </AccordionTrigger>
                <AccordionContent>
                  <Table className="text-xs">
                    <TableBody>
                      {error && (
                        <TableRow>
                          <TableCell>Error</TableCell>
                          <TableCell>
                            <pre>{error}</pre>
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>{time[i]}ms</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Memory</TableCell>
                        <TableCell>{memory[i]}KB</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );

  const classic = (
    <div className="relative flex flex-col overflow-x-auto rounded-md bg-secondary p-4">
      <div className="absolute top-2 right-2">
        <StyleSwitcher />
      </div>
      {isRunning ? (
        <pre className="flex items-center">
          <LoadingSpinner className="mr-2 h-5 w-5" />
          {verdict[0]}
        </pre>
      ) : isError ? (
        <div className="items-start">
          <Popover>
            <PopoverTrigger>
              <pre className="text-destructive hover:underline">
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
        </div>
      ) : (
        verdict.map((v: string, i: number) => (
          <pre
            className={`${v === "AC" ? "text-constructive" : "text-destructive"}`}
            key={i}
          >
            #{i + 1}{" "}
            {maps.submission.verdict[v as keyof typeof maps.submission.verdict]}{" "}
            ({time[i]}ms, {memory[i]}KB)
          </pre>
        ))
      )}
    </div>
  );

  return verdictStyle === "accordion" ? accordion : classic;
}
