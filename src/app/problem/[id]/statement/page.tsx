import { notFound } from "next/navigation";
import { getProblemData } from "@/utils/problem";

import { Statement } from "../statement";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  if (isNaN(Number(params.id))) {
    notFound();
  }

  const { problem } = await getProblemData(Number(params.id));

  return <Statement problemId={problem.id} />;
}
