import testFacility from '@jest/globals';
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
        [
          'an array',
          ({ reducer }) => ({
            reducer,
            targets: [
              [1, 2, 3],
              [0, 3, 3]
            ] as readonly [readonly number[], readonly number[]] | readonly [Iterable<number>, Iterable<number>]
          })
        ],
        ['an iterable', ({ reducer }) => ({ reducer, targets: [arrayAsIterable([1, 2, 3]), arrayAsIterable([0, 3, 3])] as const })]
      ])

      // ---

      .when('rendered with [1, 2, 3]', ({ reducer, targets }) =>
        renderHook(({ reducer, target }) => useReduceMemo<number, number>(target, reducer, 0), {
          initialProps: { reducer, target: targets[0] }
        })
      )
      .then('result should return 6', (_, result) => expect(result.result).toHaveProperty('current', 6))
      .and('reducer should have been called 3 times', ({ reducer }) => expect(reducer.mock.callCount()).toBe(3))
      .and('reducer should have been called with matching arguments', ({ reducer, targets }) =>
        expect(reducer.mock.calls.map(call => call.arguments)).toEqual([
          [0, 1, 0, targets[0]],
          [1, 2, 1, targets[0]],
          [3, 3, 2, targets[0]]
        ])
      )

      // ---

      .when('rendered with [0, 3, 3]', ({ reducer, targets }, result) => {
        result.rerender({ target: targets[1], reducer });

        return result;
      })
      .then('result should return 6', (_, result) => expect(result.result).toHaveProperty('current', 6))
      .and('reducer should have been called 6 times', ({ reducer }) => expect(reducer.mock.callCount()).toBe(6))
      .and('reducer should have been called with matching arguments', ({ reducer, targets }) =>
        expect(reducer.mock.calls.map(call => call.arguments)).toEqual([
          [0, 1, 0, targets[0]],
          [1, 2, 1, targets[0]],
          [3, 3, 2, targets[0]],
          [0, 0, 0, targets[1]],
          [0, 3, 1, targets[1]],
          [3, 3, 2, targets[1]]
        ])
      ),
  testFacility
);
