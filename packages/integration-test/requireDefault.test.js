const testFacility = require('node:test');
const { scenario } = require('@testduet/given-when-then');
const { expect } = require('expect');
const { mock } = require('node:test');
const { useReduceMemo } = require('use-reduce-memo');
const { renderHook } = require('./renderHook.cjs');

scenario(
  'basic scenario',
  bdd =>
    bdd
      .given('a summation reducer', () => ({
        reducer: mock.fn((result, value) => value + result),
        renderHook
      }))

      // ---

      .when('rendered with [1, 2, 3]', ({ reducer }) =>
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
  testFacility
);
