import { rejudge } from "@/actions/admin/judge";
import { messages } from "@/config/messages";

import { RefreshCcw } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

export function RejudgeButton({ id }: { id: number }) {
    const { toast } = useToast();

    function handleRejudge() {
        rejudge(id);

        return toast({
            variant: "constructive",
            title: messages.toast.success,
            description: `Requested rejudging for submission #${id}.`,
        });
    }

    return (
        <DropdownMenuItem onClick={handleRejudge}>
            <RefreshCcw className="mr-1 h-4 w-4" />
            Rejudge
        </DropdownMenuItem>
    );
}