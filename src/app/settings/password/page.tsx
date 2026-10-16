import { Metadata } from "next";

import { PasswordCard } from "./card";

export const metadata: Metadata = {
  title: "Password settings",
};

export default function Page() {
  return <PasswordCard />;
}
