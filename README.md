# `use-reduce-memo`

`useReduceMemo` is a React Hook that lets you cache the result of a reduce function between re-renders.

## Background

`useMemo` remembers the result of a single operation. This is sometimes insufficient for complex applications. Multiple components could be used to house individual operation, this may not be desirable in some cases.

`useReduceMemo` is similar to `Array.reduce`, which operations are performed on each element and the result is memoized. In the next render, if the operation has already performed on the same element, it will be skipped.

## Demo

Click here for [our live demo](https://compulim.github.io/use-reduce-memo/).

## How to use?

The following sample passes an array of `[1, 2, 3]` to an accumulative reducer. The return is the total sum of all values.

```ts
function MyComponent() {
  const array = [1, 2, 3];
  const accumulator = useCallback((result, value) => value + result, []);

  const result = useReduceMemo<number, number>(array, accumulator, 0);

  // Would print 6.
  return <Fragment>{result}</Fragment>;
}
```

## API

```ts
function useReduceMemo<T, U>(
  array: readonly T[],
  callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: readonly T[]) => U,
  initialValue: U
): U;
```

The API is very similar to `Array.reduce`. The target array must be passed as the first value to the hook.

## Design

We started the journey with a memoized mapper hook. However, the mapper only performs operations on the item itself. In some cases, the mapper can be refactored into multiple components, each with its own `useMemo`. The usefulness of a memoized mapper is limited.

In contrast, a memoized reducer could be turned into a memoized mapper. Thus, it shines in more scenarios.

## Behaviors

## Contributions

Like us? [Star](https://github.com/compulim/use-reduce-memo/stargazers) us.

Want to make it better? [File](https://github.com/compulim/use-reduce-memo/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/use-reduce-memo/pulls) a pull request.
