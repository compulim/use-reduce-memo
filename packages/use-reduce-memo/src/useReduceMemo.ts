import useMemoWithPrevious from './private/useMemoWithPrevious.ts';

type Entry<T, U> = Readonly<{
  input: T;
  output: U | undefined;
}>;

function useReduceMemo<T>(
  array: readonly T[],
  callbackfn: (previousValue: T | undefined, currentValue: T, currentIndex: number, array: readonly T[]) => T
): T | undefined;

function useReduceMemo<T, U>(
  array: readonly T[],
  callbackfn: (previousValue: U | undefined, currentValue: T, currentIndex: number, array: readonly T[]) => U
): U | undefined;

function useReduceMemo<T, U>(
  array: readonly T[],
  callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: readonly T[]) => U,
  initialValue: U
): U;

function useReduceMemo<T, U>(
  array: readonly T[],
  callbackfn: (previousValue: U | undefined, currentValue: T, currentIndex: number, array: readonly T[]) => U,
  initialValue?: U | undefined
): U | undefined {
  const state = useMemoWithPrevious<readonly Entry<T, U>[]>(
    (state = Object.freeze([])) => {
      let changed = array.length !== state.length;
      let prevValue: U | undefined = initialValue;
      let shouldRecompute = false;

      const nextState = array.map<Entry<T, U>>((value, index) => {
        const entry = state[+index];

        if (!shouldRecompute && entry && Object.is(entry?.input, value)) {
          prevValue = entry?.output;

          // Skips the activity if it has been reduced in the past render loop.
          return entry;
        }

        changed = true;
        shouldRecompute = true;

        return Object.freeze({
          input: value,
          output: (prevValue = callbackfn(prevValue, value, index, array))
        });
      });

      // Returns the original array if nothing changed.
      return changed ? nextState : state;
    },
    [array, callbackfn]
  );

  // eslint-disable-next-line no-magic-numbers
  return state.length ? state.at(-1)?.output : initialValue;
}

export default useReduceMemo;
