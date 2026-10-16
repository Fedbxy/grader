import { Metadata } from "next";
import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth";

import { EditAccountForm } from "./form";

export const metadata: Metadata = {
  title: "Account settings",
};

export default async function Page() {
  const { user } = await validateRequest();
  if (!user) {
    redirect("/signin");
  }

  return <EditAccountForm user={user} />;
}
