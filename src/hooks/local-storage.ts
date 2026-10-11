import { useCallback, useMemo, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
    listeners.add(onChange);
    window.addEventListener("storage", onChange);

    return () => {
        listeners.delete(onChange);
        window.removeEventListener("storage", onChange);
    };
}

export function useLocalStorage<T>(key: string, defaultValue: T) {
    const stored = useSyncExternalStore(
        subscribe,
        () => localStorage.getItem(key),
        () => null,
    );

    const value = useMemo(
        () => (stored === null ? defaultValue : (JSON.parse(stored) as T)),
        [stored, defaultValue],
    );

    const setValue = useCallback(
        (next: T) => {
            localStorage.setItem(key, JSON.stringify(next));
            listeners.forEach((listener) => listener());
        },
        [key],
    );

    return [value, setValue] as const;
}
