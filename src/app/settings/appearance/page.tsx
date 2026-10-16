import { Metadata } from "next";

import { AppearanceCard } from "./card";

export const metadata: Metadata = {
  title: "Appearance settings",
};

export default function Page() {
  return <AppearanceCard />;
}
