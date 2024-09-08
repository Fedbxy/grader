import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, defaultValue: T) {
    const [value, setValue] = useState<T>(defaultValue);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const localstorageValue = localStorage.getItem(key);

        if (localstorageValue !== null) {
            setValue(JSON.parse(localstorageValue) as T);
        }
        setIsInitialized(true);
    }, [key]);

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    }, [isInitialized, key, value]);

    return [value, setValue] as const;
}