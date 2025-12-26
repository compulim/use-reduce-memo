import React, { type DependencyList } from 'react';

// react@16 has bad exports that would fail with Node.js test runner, we need to import from root.
const { useEffect, useMemo, useRef } = React;

export default function useMemoWithPrevious<T>(factory: (prevValue: T | undefined) => T, deps: DependencyList): T {
  const prevValueRef = useRef<T | undefined>(undefined);
  // We are building a `useMemo`-like hook, `deps` is passed as-is and `factory` is not one fo the dependencies.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo<T>(() => factory(prevValueRef.current), deps);

  useEffect(() => {
    prevValueRef.current = value;
  });

  return value;
}
