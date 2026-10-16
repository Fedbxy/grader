import { Metadata } from "next";

import { ChangePasswordForm } from "./form";

export const metadata: Metadata = {
  title: "Password settings",
};

export default function Page() {
  return <ChangePasswordForm />;
}
