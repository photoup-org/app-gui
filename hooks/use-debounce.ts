import { useEffect, useRef, useState, useCallback } from 'react';
import useTimeout from './use-timeout';

/**
 * Hook to debounce a value.
 * Useful for delaying search queries or expensive computations until the user stops typing.
 *
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    const { reset } = useTimeout(() => {
        setDebouncedValue(value);
    }, delay);

    useEffect(() => {
        reset();
    }, [value, reset]);

    return debouncedValue;
}

/**
 * Hook to debounce a callback function.
 * Useful for event listeners like window resize or scroll.
 *
 * @param callback The function to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced function
 */
export function useDebounceCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
): (...args: Parameters<T>) => void {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const callbackRef = useRef(callback);

    // Keep the latest callback reference to avoid stale closures
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Clear timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const debouncedCallback = useCallback(
        (...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args);
            }, delay);
        },
        [delay]
    );

    return debouncedCallback;
}
