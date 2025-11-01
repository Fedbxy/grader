import { useState } from "react";

import { Turnstile } from "@marsidev/react-turnstile";
import { Skeleton } from "@/components/ui/skeleton";

export function TurnstileWithSkeleton({
  siteKey,
  onError,
  onExpire,
  onSuccess,
  turnstileRef,
}: {
  siteKey: string;
  onError?: (error: any) => void;
  onExpire?: () => void;
  onSuccess?: (token: string) => void;
  turnstileRef?: React.Ref<any>;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative">
      {!isLoaded && (
        <Skeleton className="h-[65px] w-full" />
      )}
      <div className={`${!isLoaded ? "opacity-0 absolute" : "opacity-100"} transition-opacity duration-300`}>
        <Turnstile
          ref={turnstileRef}
          siteKey={siteKey}
          onError={onError}
          onExpire={onExpire}
          onSuccess={onSuccess}
          onWidgetLoad={() => setIsLoaded(true)}
          options={{ size: "flexible" }}
        />
      </div>
    </div>
  );
}