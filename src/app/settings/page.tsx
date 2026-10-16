import { redirect } from "next/navigation";

// Signing in lands here; the first section is the page.
export default function Page() {
  redirect("/settings/appearance");
}
