import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import * as nodeTest from 'node:test';
import { mock } from 'node:test';
import { useReduceMemo } from 'use-reduce-memo';

scenario(
  'basic scenario',
  bdd =>
    bdd
      .given('renderHook', async () => {
        const renderHook =
          // @ts-ignore
          (await import('@testing-library/react')).renderHook ||
          // @ts-ignore
          (await import('@testing-library/react-hooks')).renderHook;

        return { renderHook };
      })
      .and('a summation reducer', ({ renderHook }) => ({
        reducer: mock.fn((result, value) => value + result),
        renderHook
      }))

      // ---

      .when('rendered with [1, 2, 3]', ({ reducer, renderHook }) =>
        renderHook(({ array, reducer }) => useReduceMemo(array, reducer, 0), {
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
      ),
  nodeTest
);
