"use client";

import { deleteUser } from "@/actions/admin/user";
import { useState } from "react";
import { messages } from "@/config/messages";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function DeleteConfirmButton({ id }: { id: number }) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function handleClick() {
    setSubmitting(true);

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
    >
      {submitting ? "Deleting..." : "Delete"}
    </Button>
  );
}
