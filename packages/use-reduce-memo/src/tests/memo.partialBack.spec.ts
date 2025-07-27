import { scenario } from '@testduet/given-when-then';
import { renderHook } from '@testing-library/react';
import { expect } from 'expect';
import * as nodeTest from 'node:test';
import { mock } from 'node:test';
import useReduceMemo from '../useReduceMemo.ts';

scenario(
  'call twice with array with same content',
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

      .when('rendered with [0, 3, 3]', ({ reducer }, result) => {
        result.rerender({ array: [0, 3, 3], reducer });

        return result;
      })
      .then('result should return 6', (_, result) => expect(result.result).toHaveProperty('current', 6))
      .and('reducer should have been called 6 times', ({ reducer }) => expect(reducer.mock.callCount()).toBe(6))
      .and('reducer should have been called with matching arguments', ({ reducer }) =>
        expect(reducer.mock.calls.map(call => call.arguments)).toEqual([
          [0, 1, 0, [1, 2, 3]],
          [1, 2, 1, [1, 2, 3]],
          [3, 3, 2, [1, 2, 3]],
          [0, 0, 0, [0, 3, 3]],
          [0, 3, 1, [0, 3, 3]],
          [3, 3, 2, [0, 3, 3]]
        ])
      ),
  nodeTest
);
