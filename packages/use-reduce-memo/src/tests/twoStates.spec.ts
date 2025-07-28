import testFacility from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import { act, cleanup, render } from '@testing-library/react';
import { expect } from 'expect';
import { mock } from 'node:test';
import { createElement, Fragment, useState } from 'react';
import arrayAsIterable from '../../tests/arrayAsIterable.ts';
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
              [2, 4, 6]
            ] as readonly [readonly number[], readonly number[]] | readonly [Iterable<number>, Iterable<number>]
          })
        ],
        [
          'an iterable',
          ({ reducer }) => ({ reducer, targets: [arrayAsIterable([1, 2, 3]), arrayAsIterable([2, 4, 6])] as const })
        ]
      ])

      // ---

      .and('with TestComponent with useState', ({ reducer, targets }) => {
        function TestComponent({ values }: { readonly values: readonly number[] | Iterable<number> }) {
          const result = useReduceMemo(values, reducer, 0);
          const [state, setState] = useState(1);

          return createElement(
            Fragment,
            {},
            createElement('div', {}, `Result is ${result}.`),
            createElement(
              'button',
              {
                onClick: () => setState(value => value + 1),
                type: 'button'
              },
              `Click me (${state})`
            )
          );
        }

        return { reducer, targets, TestComponent };
      })

      // ---

      .when(
        'is being rendered with [1, 2, 3]',
        ({ targets, TestComponent }) => render(createElement(TestComponent, { values: targets[0] })),
        cleanup
      )
      .then('textContent should match', (_, result) => {
        expect(result.container).toHaveProperty('textContent', 'Result is 6.Click me (1)');
      })
      .and('reducer should have been called 3 times', ({ reducer }) => {
        expect(reducer.mock.callCount()).toBe(3);
      })
      .and('reducer should have been called with matching arguments', ({ reducer, targets }) => {
        expect(reducer.mock.calls.map(call => call.arguments)).toEqual([
          [0, 1, 0, targets[0]],
          [1, 2, 1, targets[0]],
          [3, 3, 2, targets[0]]
        ]);
      })

      // ---

      .when('the button is being clicked', (_, result) => {
        act(() => result.getByText('Click me (1)').click());

        return result;
      })
      .then('textContent should match', (_, result) => {
        expect(result.container).toHaveProperty('textContent', 'Result is 6.Click me (2)');
      })
      .and('reducer should not have been called', ({ reducer }) => {
        expect(reducer.mock.callCount()).toBe(3);
      })

      // ---

      .when('the values array changed to [2, 4, 6]', ({ targets, TestComponent }, result) => {
        result.rerender(createElement(TestComponent, { values: targets[1] }));

        return result;
      })
      .then('textContent should match', (_, result) => {
        expect(result.container).toHaveProperty('textContent', 'Result is 12.Click me (2)');
      })
      .and('reducer should not have been called', ({ reducer }) => {
        expect(reducer.mock.callCount()).toBe(6);
      })
      .and('reducer should have been called with matching arguments', ({ reducer, targets }) => {
        expect(reducer.mock.calls.map(call => call.arguments)).toEqual([
          [0, 1, 0, targets[0]],
          [1, 2, 1, targets[0]],
          [3, 3, 2, targets[0]],
          [0, 2, 0, targets[1]],
          [2, 4, 1, targets[1]],
          [6, 6, 2, targets[1]]
        ]);
      }),
  testFacility
);
