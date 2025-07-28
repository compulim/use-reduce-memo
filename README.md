# `use-reduce-memo`

`useReduceMemo` is a React Hook that lets you cache the result of a reduce function between re-renders.

## Background

[`useMemo`](https://react.dev/reference/react/useMemo) remembers the result of a single operation. This is sometimes insufficient for complex applications. Multiple components could be used to house individual operation, this may not be desirable in some cases.

`useReduceMemo` is similar to [`Array.reduce`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce), which operations are performed on every element and the result is memoized. In the next render, if the operation has already performed on the same element, it will be skipped.

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
  target: readonly T[] | Iterable<T>,
  callbackfn: (previousValue: U, currentValue: T, currentIndex: number, target: readonly T[] | Iterable<T>) => U,
  initialValue: U
): U;
```

The API is very similar to [`Array.reduce`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) and [`Iterator.reduce`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/reduce). The target must be passed as the first value to the hook.

Notes: `callbackfn` should be memoized with [`useCallback`](https://react.dev/reference/react/useCallback) or [`useMemo`](https://react.dev/reference/react/useMemo). If `callbackfn` is changed, all memoized results will be invalidated.

## Design

We started the journey with a memoized mapper hook. However, the mapper only performs operations on the item itself. In some cases, the mapper can be refactored into multiple components, each with its own [`useMemo`](https://react.dev/reference/react/useMemo). The usefulness of a memoized mapper is limited.

In contrast, a memoized reducer could be turned into a memoized mapper. Thus, it shines in more scenarios.

## Behaviors

### How would the memoized result gets invalidate?

Every element in the array is memoized sequentially, the equality check includes:

- The element value
- The `callbackfn`

The equality check is performed by the [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) function. If an element is invalidated, all subsequent elements in the array will also be invalidated.

Given same instance of `callbackfn`:

- `[1, 2, 3]` followed by `[1, 2, 3, 4]` will call reducer 4 times with: 1, 2, 3, 4
- `[1, 2, 3]` followed by `[1, 2, 2.5, 3]` will call reducer 5 times with: 1, 2, 3, 2.5, 3
- `[1, 2, 3]` followed by `[1, 2]` will call reducer 3 times with: 1, 2, 3
- `[1, 2, 3]` followed by `[]`, then followed by `[1, 2, 3]` will call reducer 6 times with: 1, 2, 3, 1, 2, 3
- `[1, 2, 3]` followed by `[0, 1, 2, 3]` will call reducer 7 times with: 1, 2, 3, 0, 1, 2, 3

## Contributions

Like us? [Star](https://github.com/compulim/use-reduce-memo/stargazers) us.

Want to make it better? [File](https://github.com/compulim/use-reduce-memo/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/use-reduce-memo/pulls) a pull request.
