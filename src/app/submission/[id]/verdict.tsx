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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

export function Verdict({
  submissionId,
  testcases,
  problemScore,
}: {
  submissionId: number;
  testcases: number;
  problemScore: number;
}) {
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

  const { result, status, errorCode, error } = data;
  const scores = result.scores;
  const verdicts = result.verdicts;
  const times = result.times;
  const memories = result.memories;
  const weights = result.weights;
  const weight =
    weights?.reduce((a: number, b: number) => a + b, 0) || testcases;

  if (isRunning) {
    return (
      <div className="rounded-lg border">
        <pre className="flex items-center p-4">
          <LoadingSpinner className="mr-2 h-5 w-5" />
          {status}
        </pre>
      </div>
    );
  }

  if (errorCode) {
    return (
      <div className="rounded-lg border">
        <Popover>
          <PopoverTrigger>
            <pre className="p-4 text-destructive hover:underline">
              {
                maps.submission.verdict[
                  errorCode as keyof typeof maps.submission.verdict
                ]
              }
            </pre>
          </PopoverTrigger>
          <PopoverContent className="w-full max-w-md overflow-x-auto md:max-w-xl">
            <pre className="text-destructive">{error}</pre>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  const table = (
    <div>
      <Separator className="" />
      {verdicts?.map((subtask_verdicts: string[], subtask: number) => {
        const subtaskWeight = weights ? weights[subtask] : 1;
        const subtaskFullScore = (subtaskWeight / weight) * problemScore;
        const subtaskScore =
          (scores[subtask] / subtaskWeight) * subtaskFullScore;

        return (
          <Accordion type="single" collapsible key={subtask}>
            <AccordionItem value={`subtask-${subtask}`}>
              <AccordionTrigger className="p-2 px-4">
                <span className="flex w-full items-center justify-between">
                  Subtask {subtask + 1}
                  <Badge
                    className="mr-2 text-nowrap"
                    variant={`${subtaskScore === subtaskFullScore ? "constructive" : "destructive"}`}
                  >
                    {subtaskScore} / {subtaskFullScore}
                  </Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">#</TableHead>
                      <TableHead>Verdict</TableHead>
                      <TableHead className="text-nowrap text-right">
                        Execution Time
                      </TableHead>
                      <TableHead className="text-nowrap text-right">
                        Memory Used
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subtask_verdicts.map((v: string, i: number) => (
                      <TableRow key={i}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              v === "AC" ? "constructive" : "destructive"
                            }
                            className="text-nowrap capitalize"
                          >
                            {
                              maps.submission.verdict[
                                v as keyof typeof maps.submission.verdict
                              ]
                            }
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {times[subtask][i]} ms
                        </TableCell>
                        <TableCell className="text-right">
                          {memories[subtask][i]} KB
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      })}
    </div>
  );

  const classic = (
    <div className="flex flex-col overflow-x-auto rounded-lg border bg-secondary p-4">
      {verdicts?.map((subtask_verdicts: string[], subtask: number) => {
        const subtaskWeight = weights ? weights[subtask] : 1;
        const subtaskFullScore = (subtaskWeight / weight) * problemScore;
        const subtaskScore =
          (scores[subtask] / subtaskWeight) * subtaskFullScore;

        return (
          <div key={subtask} className="mb-4">
            <h3
              className={
                "mb-2 text-lg font-semibold" +
                (subtaskScore === subtaskFullScore
                  ? " text-constructive"
                  : " text-destructive")
              }
            >
              Subtask {subtask + 1} ({subtaskScore}/{subtaskFullScore})
            </h3>
            {subtask_verdicts.map((v: string, i: number) => (
              <pre
                className={`${
                  v === "AC" ? "text-constructive" : "text-destructive"
                }`}
                key={i}
              >
                #{i + 1}{" "}
                {
                  maps.submission.verdict[
                    v as keyof typeof maps.submission.verdict
                  ]
                }{" "}
                ({times[subtask][i]}ms, {memories[subtask][i]}KB)
              </pre>
            ))}
          </div>
        );
      })}
    </div>
  );

  return verdictStyle === "table" ? table : classic;
}
