import { validateRequest } from "@/lib/auth";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export default async function Page() {
  const { user } = await validateRequest();

  return (
    <div className="flex min-h-screen-minus-header-footer flex-col items-center justify-center px-8 py-12">
      <h1 className="mb-4 text-center text-5xl font-extrabold">
        Read, Code, Submit, Pass!
      </h1>
      <p className="mb-8 max-w-xl text-center text-lg">
        Practice your coding skills, prepare for contests, and become a god in
        competitive programming. Start your journey today!
      </p>
      <div className="flex flex-col items-center gap-4 md:flex-row md:gap-8">
        <Link href={user ? "/submission/my" : "/signup"}>
          <Button className="text-lg font-semibold">
            {user ? "Continue your journey" : "Get Started"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <Link href="/problemset">
          <Button variant="secondary" className="text-lg font-semibold">
            Problems
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
