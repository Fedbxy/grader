import { useSyncExternalStore } from "react";

/**
 * Whether the media query matches. null while rendering on the server and
 * during hydration, when it isn't known yet; render a placeholder then.
 */
export function useMediaQuery(query: string): boolean | null {
    return useSyncExternalStore(
        (onChange) => {
            const list = window.matchMedia(query);
            list.addEventListener("change", onChange);
            return () => list.removeEventListener("change", onChange);
        },
        () => window.matchMedia(query).matches,
        () => null,
    );
}
