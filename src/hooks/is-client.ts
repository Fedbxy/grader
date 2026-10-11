import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False while rendering on the server and during hydration, true afterwards.
 * Use it to render a placeholder where the first client render would otherwise
 * differ from the server HTML (browser-only values, client-only widgets).
 */
export function useIsClient() {
    return useSyncExternalStore(
        subscribe,
        () => true,
        () => false,
    );
}
