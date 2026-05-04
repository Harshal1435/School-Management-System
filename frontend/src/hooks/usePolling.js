import { useEffect, useRef, useCallback } from 'react';

/**
 * Calls `fetchFn` immediately, then every `intervalMs` milliseconds.
 * Cleans up on unmount or when dependencies change.
 *
 * @param {Function} fetchFn   - async function to call
 * @param {number}   intervalMs - polling interval (default 15 000 ms)
 * @param {Array}    deps       - extra dependencies that should restart the interval
 */
const usePolling = (fetchFn, intervalMs = 15000, deps = []) => {
  const savedFn = useRef(fetchFn);

  // Keep ref up-to-date without restarting the interval
  useEffect(() => { savedFn.current = fetchFn; });

  useEffect(() => {
    savedFn.current(); // immediate call
    const id = setInterval(() => savedFn.current(), intervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, ...deps]);
};

export default usePolling;
