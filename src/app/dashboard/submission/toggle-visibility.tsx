import { setSubmissionHidden } from "@/actions/admin/submission";
import { useRouter } from "next/navigation";

import { Eye, EyeOff } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function ToggleVisibility({
  id,
  hidden,
}: {
  id: number;
  hidden: boolean;
}) {
  const router = useRouter();

  async function handleToggle() {
    const result = await setSubmissionHidden(id, !hidden);

    if (result?.error) {
      return toast.error(result.error);
    }

    toast.success(`Submission #${id} is now ${hidden ? "shown" : "hidden"}.`);
    router.refresh();
  }

  return (
    <DropdownMenuItem onClick={handleToggle}>
      {hidden ? (
        <Eye className="mr-1 h-4 w-4" />
      ) : (
        <EyeOff className="mr-1 h-4 w-4" />
      )}
      {hidden ? "Show" : "Hide"}
    </DropdownMenuItem>
  );
}
