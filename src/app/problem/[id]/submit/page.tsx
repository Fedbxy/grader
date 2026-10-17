import { redirect } from "next/navigation";

// The problem page is one workspace now.
export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  redirect(`/problem/${params.id}`);
}
