import useMemoWithPrevious from './private/useMemoWithPrevious.ts';

interface Reducer<T, U, V extends U | undefined = U | undefined> {
  (previousValue: V, currentValue: T, currentIndex: number, array: readonly T[]): U;
}

type Entry<T, U> = Readonly<{
  callbackfn: Reducer<T, U | undefined, U>;
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

/**
 * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
 *
 * @template T The type of elements in the input array.
 * @template U The type of the reduced output value.
 *
 * @param array The input array to be reduced. Must be a readonly array.
 * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
 *
 * @returns The single value that results from the reduction, or `undefined` if the array is empty and no initial value is provided.
 *
 * @example
 * ```ts
 * const array = [1, 2, 3];
 * const reducer = useCallback((prev, curr) => prev + curr, []);
 *
 * const sum = useReduceMemo(array, reducer, 0);
 *
 * console.log(sum); // Output: 6
 * ```
 */
// TODO: Should we have a `useBuildReducer()` hook which, `useBuildReducer(reducer, 0)([1, 2, 3])`?
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

        if (!shouldRecompute && entry && Object.is(entry?.input, value) && Object.is(entry?.callbackfn, callbackfn)) {
          prevValue = entry?.output;

          // Skips the activity if it has been reduced in the past render loop.
          return entry;
        }

        changed = true;
        shouldRecompute = true;

        return Object.freeze({
          callbackfn,
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
