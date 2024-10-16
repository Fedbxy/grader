import { useState, useRef } from "react";
import { TurnstileInstance } from "@marsidev/react-turnstile";
import { TurnstileStatus } from "@/types/turnstile";

export function useTurnstile() {
    const turnstileRef = useRef<TurnstileInstance | null>(null);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [turnstileStatus, setTurnstileStatus] = useState<TurnstileStatus>("required");

    const handleTurnstileError = (error: any) => {
        setTurnstileStatus("error");
    };

    const handleTurnstileExpire = () => {
        setTurnstileStatus("expired");
    };

    const handleTurnstileSuccess = (token: string) => {
        setTurnstileToken(token);
        setTurnstileStatus("success");
    };

    const resetTurnstile = () => {
        turnstileRef.current?.reset();
        setTurnstileToken(null);
        setTurnstileStatus("required");
    };

    return {
        turnstileRef,
        turnstileToken,
        turnstileStatus,
        handleTurnstileError,
        handleTurnstileExpire,
        handleTurnstileSuccess,
        resetTurnstile,
    };
}