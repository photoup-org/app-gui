import { useCallback, useEffect, useRef } from "react"

export default function useTimeout(callback: () => void, delay: number | null) {
    const callbackRef = useRef(callback)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        callbackRef.current = callback
    }, [callback])

    const set = useCallback(() => {
        if (delay === null) return
        timeoutRef.current = setTimeout(() => callbackRef.current(), delay)
    }, [delay])

    const clear = useCallback(() => {
        timeoutRef.current && clearTimeout(timeoutRef.current)
    }, [])

    useEffect(() => {
        set()
        return clear
    }, [delay, set, clear])

    const reset = useCallback(() => {
        clear()
        set()
    }, [clear, set])

    return { reset, clear }
}