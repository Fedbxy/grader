import { ProblemWorkspace } from "./problem-workspace";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  return <ProblemWorkspace id={Number(params.id)} />;
}
