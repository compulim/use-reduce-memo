import testFacility from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import { mock } from 'node:test';
import { renderHook } from '../../tests/renderHook.ts';
import useReduceMemo from '../useReduceMemo.ts';

scenario(
  're-render with shorter array',
  bdd =>
    bdd
      .given('a summation reducer', () => ({
        reducer: mock.fn<(result: number, value: number) => number>((result, value) => value + result)
      }))

      // ---

      .when('rendered with [1, 2, 3]', ({ reducer }) =>
        renderHook(({ array, reducer }) => useReduceMemo<number, number>(array, reducer, 0), {
          initialProps: { array: [1, 2, 3], reducer }
        })
      )
      .then('result should return 6', (_, result) => expect(result.result).toHaveProperty('current', 6))
      .and('reducer should have been called 3 times', ({ reducer }) => expect(reducer.mock.callCount()).toBe(3))
      .and('reducer should have been called with matching arguments', ({ reducer }) =>
        expect(reducer.mock.calls.map(call => call.arguments)).toEqual([
          [0, 1, 0, [1, 2, 3]],
          [1, 2, 1, [1, 2, 3]],
          [3, 3, 2, [1, 2, 3]]
        ])
      )

      // ---

      .when('rendered with [1, 2]', ({ reducer }, result) => {
        result.rerender({ array: [1, 2], reducer });

        return result;
      })
      .then('result should return 3', (_, result) => expect(result.result).toHaveProperty('current', 3))
      .and('reducer should not have been called', ({ reducer }) => expect(reducer.mock.callCount()).toBe(3)),
  testFacility
);
