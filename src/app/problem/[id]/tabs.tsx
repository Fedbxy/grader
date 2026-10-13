"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { SquareSplitHorizontal } from "lucide-react";

export function ProblemTabs({ problemId }: { problemId: number }) {
  const pathname = usePathname();

  return (
    <Tabs defaultValue={pathname.split("/")[3] ?? "split"}>
      <TabsList>
        <TabsTrigger value="split" className="hidden md:inline-flex" asChild>
          <Link href={`/problem/${problemId}`}>
            <SquareSplitHorizontal className="h-5 w-5" />
          </Link>
        </TabsTrigger>
        <Separator
          orientation="vertical"
          className="ml-1 mr-1 hidden md:block"
        />
        <TabsTrigger value="statement" asChild>
          <Link href={`/problem/${problemId}/statement`}>Statement</Link>
        </TabsTrigger>
        <TabsTrigger value="submit" asChild>
          <Link href={`/problem/${problemId}/submit`}>Submit</Link>
        </TabsTrigger>
        <Separator orientation="vertical" className="ml-1 mr-1" />
        <TabsTrigger value="submission" asChild>
          <Link href={`/problem/${problemId}/submission`}>Submission</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
