import testFacility from 'node:test';
import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import { mock } from 'node:test';
import arrayAsIterable from '../../tests/arrayAsIterable.ts';
import { renderHook } from '../../tests/renderHook.ts';
import useReduceMemo from '../useReduceMemo.ts';

scenario(
  'call twice with array with same content',
  bdd =>
    bdd
      .given('a summation reducer', () => ({
        reducer: mock.fn<(result: number, value: number) => number>((result, value) => value + result)
      }))
      .and.oneOf([
        ['an array', ({ reducer }) => ({ reducer, target: [1, 2, 3] as number[] | Iterable<number> })],
        ['an iterable', ({ reducer }) => ({ reducer, target: arrayAsIterable([1, 2, 3]) })]
      ])

      // ---

      .when('rendered with [1, 2, 3]', ({ reducer, target }) =>
        renderHook(({ reducer }) => useReduceMemo<number, number>(target, reducer, 0), {
          initialProps: { reducer }
        })
      )
      .then('result should return 6', (_, result) => expect(result.result).toHaveProperty('current', 6))
      .and('reducer should have been called 3 times', ({ reducer }) => expect(reducer.mock.callCount()).toBe(3))
      .and('reducer should have been called with matching arguments', ({ reducer, target }) =>
        expect(reducer.mock.calls.map(call => call.arguments)).toEqual([
          [0, 1, 0, target],
          [1, 2, 1, target],
          [3, 3, 2, target]
        ])
      )

      // ---

      .when('re-rendered', ({ reducer }, result) => {
        result.rerender({ reducer });

        return result;
      })
      .then('result should return 6', (_, result) => expect(result.result).toHaveProperty('current', 6))
      .and('reducer should have been called 3 times', ({ reducer }) => expect(reducer.mock.callCount()).toBe(3)),
  testFacility
);
