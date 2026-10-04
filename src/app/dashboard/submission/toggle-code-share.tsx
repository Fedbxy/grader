import { setCodePublic } from "@/actions/submission";
import { useRouter } from "next/navigation";

import { Lock, Share2 } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function ToggleCodeShare({
  id,
  codePublic,
  hidden,
}: {
  id: number;
  codePublic: boolean;
  hidden: boolean;
}) {
  const router = useRouter();

  async function handleToggle() {
    const result = await setCodePublic(id, !codePublic);

    if (result?.error) {
      return toast.error(result.error);
    }

    toast.success(
      `Code for submission #${id} is now ${codePublic ? "private" : "shared"}.`,
    );
    router.refresh();
  }

  return (
    // A hidden submission can't start sharing; sharing already on can stop.
    <DropdownMenuItem
      onClick={handleToggle}
      disabled={hidden && !codePublic}
      title={hidden && !codePublic ? "Hidden submissions can't be shared." : undefined}
    >
      {codePublic ? (
        <Lock className="mr-1 h-4 w-4" />
      ) : (
        <Share2 className="mr-1 h-4 w-4" />
      )}
      {codePublic ? "Stop sharing" : "Share code"}
    </DropdownMenuItem>
  );
}
