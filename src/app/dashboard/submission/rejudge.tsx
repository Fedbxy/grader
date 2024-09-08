import { rejudge } from "@/actions/admin/judge";

import { RefreshCcw } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function RejudgeButton({ id }: { id: number }) {
    async function handleRejudge() {
        await rejudge(id);

        return toast.success(`Requested rejudging for submission #${id}.`);
    }

    return (
        <DropdownMenuItem onClick={handleRejudge}>
            <RefreshCcw className="mr-1 h-4 w-4" />
            Rejudge
        </DropdownMenuItem>
    );
}