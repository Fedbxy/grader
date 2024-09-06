"use client";

import { deleteUser } from "@/actions/admin/user";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertDialogAction } from "@/components/ui/alert-dialog";

export function DeleteConfirmButton({ validateId, id }: { validateId: number, id: number }) {
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
      return toast.error(response.error);
    }

    return toast.success("You have successfully deleted the user.");
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
