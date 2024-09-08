"use client";

import { banUser, unbanUser } from "@/actions/admin/user";
import { useState } from "react";
import { messages } from "@/config/messages";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertDialogAction } from "@/components/ui/alert-dialog";

export function ConfirmButton({ unban, validateId, id }: { unban: boolean, validateId: number, id: number }) {
  const [submitting, setSubmitting] = useState(false);

  async function handleClick() {
    setSubmitting(true);

    if (validateId === id) {
      return toast.error(messages.database.banSelf);
    }

    const response = unban ? await unbanUser(id) : await banUser(id);

    if (response?.error) {
      return toast.error(response.error);
    }

    return toast.success(`You have successfully ${unban ? "unbanned" : "banned"} the user.`);
  }

  return (
    <Button
      variant="destructive"
      disabled={submitting}
      onClick={() => handleClick()}
      asChild
    >
      <AlertDialogAction>
        {submitting ? (unban ? "Unbanning..." : "Banning...") : (unban ? "Unban" : "Ban")}
      </AlertDialogAction>
    </Button>
  );
}
