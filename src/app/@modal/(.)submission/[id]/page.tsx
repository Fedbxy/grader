import { SubmissionDetails } from "@/app/submission/[id]/details";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  return <SubmissionDetails id={id} variant="modal" />;
}
