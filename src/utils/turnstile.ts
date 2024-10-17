import { toast } from "sonner";
import { TurnstileStatus } from "@/types/turnstile";

export function handleTurnstileStatus(turnstileStatus: TurnstileStatus) {
    const messages = {
        required: "The CAPTCHA verification is required.",
        error: "The CAPTCHA verification failed.",
        expired: "The CAPTCHA verification has expired.",
    };

    if (turnstileStatus === "success") {
        return false;
    }

    toast.error(messages[turnstileStatus]);
    return true;
}