import { useCallback, useRef, useEffect, useState } from "react";

/**
 * Custom hook for debouncing function calls
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds
 * @param options - Additional options for the debounce behavior
 * @returns A debounced version of the callback function
 */
export function useDebounce<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number,
  options: {
    leading?: boolean; // Execute on the leading edge
    trailing?: boolean; // Execute on the trailing edge (default: true)
    maxWait?: number; // Maximum time to wait before executing
  } = {}
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const lastCallTimeRef = useRef<number>(0);
  const lastInvokeTimeRef = useRef<number>(0);

  const { leading = false, trailing = true, maxWait } = options;

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTimeRef.current;
      const timeSinceLastInvoke = now - lastInvokeTimeRef.current;

      lastCallTimeRef.current = now;

      // Clear existing timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }

      // Execute immediately if leading edge and it's the first call
      if (leading && timeSinceLastCall >= delay) {
        lastInvokeTimeRef.current = now;
        callbackRef.current(...args);
        return;
      }

      // Set up trailing edge execution
      if (trailing) {
        timeoutRef.current = setTimeout(() => {
          lastInvokeTimeRef.current = Date.now();
          callbackRef.current(...args);
        }, delay);
      }

      // Set up max wait timeout
      if (maxWait && timeSinceLastInvoke >= maxWait) {
        lastInvokeTimeRef.current = Date.now();
        callbackRef.current(...args);
      } else if (maxWait) {
        maxTimeoutRef.current = setTimeout(() => {
          lastInvokeTimeRef.current = Date.now();
          callbackRef.current(...args);
        }, maxWait - timeSinceLastInvoke);
      }
    },
    [delay, leading, trailing, maxWait]
  ) as T;

  return debouncedCallback;
}

/**
 * Custom hook for debouncing values
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for throttling function calls
 * @param callback - The function to throttle
 * @param delay - The delay in milliseconds
 * @returns A throttled version of the callback function
 */
export function useThrottle<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastCallTimeRef = useRef<number>(0);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallTimeRef.current >= delay) {
        lastCallTimeRef.current = now;
        callbackRef.current(...args);
      }
    },
    [delay]
  ) as T;

  return throttledCallback;
}

/**
 * Custom hook for immediate execution with debounced cleanup
 * Useful for search inputs where you want immediate feedback but debounced API calls
 * @param callback - The function to execute
 * @param delay - The delay in milliseconds
 * @returns An object with immediate and debounced versions of the callback
 */
export function useImmediateDebounce<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const immediate = useCallback((...args: Parameters<T>) => {
    callbackRef.current(...args);
  }, []);

  const debounced = useCallback(
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

  return { immediate, debounced };
}
