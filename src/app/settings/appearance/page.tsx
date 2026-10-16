import { Metadata } from "next";

import { AppearanceSettings } from "./settings";

export const metadata: Metadata = {
  title: "Appearance settings",
};

export default function Page() {
  return <AppearanceSettings />;
}
