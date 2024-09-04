"use client";

import { deleteUser } from "@/actions/admin/user";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ConfirmButton({ id }: { id: number }) {
  const [submitting, setSubmitting] = useState(false);

  async function handleClick() {
    setSubmitting(true);

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
    >
      {submitting ? "Deleting..." : "Delete"}
    </Button>
  );
}
