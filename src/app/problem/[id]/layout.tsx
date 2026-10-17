import { notFound } from "next/navigation";

export default async function ProblemLayout(props: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const params = await props.params;

  if (isNaN(Number(params.id))) {
    notFound();
  }

  return props.children;
}
