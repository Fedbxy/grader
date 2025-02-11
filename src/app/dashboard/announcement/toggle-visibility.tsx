import { changeVisibility } from "@/actions/admin/announcement";
import { Visibility } from "@/types/announcement";
import { useRouter } from "next/navigation";

import { RefreshCcw } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function ToggleVisibility({
  id,
  visibility,
}: {
  id: number;
  visibility: Visibility;
}) {
  const router = useRouter();

  const newVisibility = visibility === "public" ? "private" : "public";

  async function handleToggle() {
    const result = await changeVisibility(id, newVisibility);

    if (result?.error) {
      return toast.error(result.error);
    }

    toast.success(`Announcement #${id} is now ${newVisibility}.`);
    router.refresh();
  }

  return (
    <DropdownMenuItem onClick={handleToggle}>
      <RefreshCcw className="mr-1 h-4 w-4" />
      {visibility === "public" ? "Make Private" : "Make Public"}
    </DropdownMenuItem>
  );
}
