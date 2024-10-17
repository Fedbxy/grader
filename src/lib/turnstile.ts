import { headers } from "next/headers";

export async function verifyTurnstile(token: string) {
    const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    const secret = process.env.NEXT_PRIVATE_TURNSTILE_SECRET_KEY as string;
    const ip = headers().get("x-forwarded-for") as string;

    const formData = new FormData();
    formData.append("secret", secret);
    formData.append("response", token);
    formData.append("remoteip", ip);

    try {
        const response = await fetch(url, {
            method: "POST",
            body: formData,
        });

        const outcome = await response.json();
        if (!outcome.success) {
            return {
                success: false,
                error: "The CAPTCHA is invalid. Please try again.",
            };
        }

        return {
            success: true,
        };
    } catch (error) {
        console.error("Error: ", error);
        return {
            success: false,
            error: "Unable to verify the CAPTCHA. Please try again.",
        };
    }
}