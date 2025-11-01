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
        <Link href={`/problem/${problemId}`}>
          <TabsTrigger value="split" className="hidden md:block">
            <SquareSplitHorizontal className="h-5 w-5" />
          </TabsTrigger>
        </Link>
        <Separator
          orientation="vertical"
          className="ml-1 mr-1 hidden md:block"
        />
        <Link href={`/problem/${problemId}/statement`}>
          <TabsTrigger value="statement">Statement</TabsTrigger>
        </Link>
        <Link href={`/problem/${problemId}/submit`}>
          <TabsTrigger value="submit">Submit</TabsTrigger>
        </Link>
        <Separator orientation="vertical" className="ml-1 mr-1" />
        <Link href={`/problem/${problemId}/submission`}>
          <TabsTrigger value="submission">Submission</TabsTrigger>
        </Link>
      </TabsList>
    </Tabs>
  );
}
