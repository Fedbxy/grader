import { Metadata } from "next";

import { AccountCard } from "./card";

export const metadata: Metadata = {
  title: "Account settings",
};

export default function Page() {
  return <AccountCard />;
}
