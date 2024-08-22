"use client";

import { deleteUser } from "@/actions/admin/user";
import { useState } from "react";
import { messages } from "@/config/messages";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialogAction } from "@/components/ui/alert-dialog";

export function DeleteConfirmButton({ validateId, id }: { validateId: number, id: number }) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function handleClick() {
    setSubmitting(true);

    if (validateId === id) {
      return toast({
        variant: "destructive",
        title: messages.toast.error,
        description: messages.database.deleteSelf,
      });
    }

    const response = await deleteUser(id);

    if (response?.error) {
      return toast({
        variant: "destructive",
        title: messages.toast.error,
        description: response.error,
      });
    }

    return toast({
      variant: "constructive",
      title: messages.toast.success,
      description: "You have successfully deleted the user.",
    });
  }

  return (
    <Button
      variant="destructive"
      disabled={submitting}
      onClick={() => handleClick()}
      asChild
    >
      <AlertDialogAction>
        {submitting ? "Deleting..." : "Delete"}
      </AlertDialogAction>
    </Button>
  );
}
