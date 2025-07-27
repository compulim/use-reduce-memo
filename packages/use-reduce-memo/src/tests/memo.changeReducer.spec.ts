import testFacility from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import { mock } from 'node:test';
import { renderHook } from '../../tests/renderHook.ts';
import useReduceMemo from '../useReduceMemo.ts';

scenario(
  'call twice with array with same content',
  bdd =>
    bdd
      .given('2 reducers', () => ({
        reducers: [
          mock.fn<(result: number, value: number) => number>((result, value) => value + result),
          mock.fn<(result: number, value: number) => number>((result, value) => value + result)
        ]
      }))

      // ---

      .when('rendered with the first reducer', ({ reducers }) =>
        renderHook(({ array, reducer }) => useReduceMemo<number, number>(array, reducer, 0), {
          initialProps: { array: [1, 2, 3], reducer: reducers[0]! }
        })
      )
      .then('result should return 6', (_, result) => expect(result.result).toHaveProperty('current', 6))
      .and('the first reducer should have been called 3 times', ({ reducers }) =>
        expect(reducers[0]!.mock.callCount()).toBe(3)
      )
      .and('the first reducer should have been called with matching arguments', ({ reducers }) =>
        expect(reducers[0]!.mock.calls.map(call => call.arguments)).toEqual([
          [0, 1, 0, [1, 2, 3]],
          [1, 2, 1, [1, 2, 3]],
          [3, 3, 2, [1, 2, 3]]
        ])
      )
      .and('the second reducer should never been called', ({ reducers }) =>
        expect(reducers[1]!.mock.callCount()).toBe(0)
      )

      // ---

      .when('rendered with the second reducer', ({ reducers }, result) => {
        result.rerender({ array: [1, 2, 3], reducer: reducers[1]! });

        return result;
      })
      .then('result should return 6', (_, result) => expect(result.result).toHaveProperty('current', 6))
      .and('the first reducer should not have been called', ({ reducers }) =>
        expect(reducers[0]!.mock.callCount()).toBe(3)
      )
      .and('the second reducer should have been called 3 times', ({ reducers }) =>
        expect(reducers[1]!.mock.callCount()).toBe(3)
      )
      .and('the second reducer should have been called with matching arguments', ({ reducers }) =>
        expect(reducers[1]!.mock.calls.map(call => call.arguments)).toEqual([
          [0, 1, 0, [1, 2, 3]],
          [1, 2, 1, [1, 2, 3]],
          [3, 3, 2, [1, 2, 3]]
        ])
      ),
  testFacility
);
