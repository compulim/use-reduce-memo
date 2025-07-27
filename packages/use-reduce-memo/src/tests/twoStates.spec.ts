import { scenario } from '@testduet/given-when-then';
import { cleanup, render } from '@testing-library/react';
import { expect } from 'expect';
import * as nodeTest from 'node:test';
import { mock } from 'node:test';
import { act, createElement, Fragment, useState } from 'react';
import { importRenderHook, type RenderHook } from '../../importRenderHook.ts';
0import useReduceMemo from '../useReduceMemo.ts';

let renderHook: RenderHook;

nodeTest.beforeEach(async () => {
  renderHook = await importRenderHook();
});

scenario(
  'call twice with array with same content',
  bdd =>
    bdd
      .given('a summation reducer', () => ({
        reducer: mock.fn<(result: number, value: number) => number>((result, value) => value + result)
      }))

      // ---

      .and('with TestComponent with useState', ({ reducer }) => {
        function TestComponent({ values }: { readonly values: readonly number[] }) {
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

        return { reducer, TestComponent };
      })

      // ---

      .when(
        'is being rendered with [1, 2, 3]',
        ({ TestComponent }) => render(createElement(TestComponent, { values: [1, 2, 3] })),
        cleanup
      )
      .then('textContent should match', (_, result) => {
        expect(result.container).toHaveProperty('textContent', 'Result is 6.Click me (1)');
      })
      .and('reducer should have been called 3 times', ({ reducer }) => {
        expect(reducer.mock.callCount()).toBe(3);
      })
      .and('reducer should have been called with matching arguments', ({ reducer }) => {
        expect(reducer.mock.calls.map(call => call.arguments)).toEqual([
          [0, 1, 0, [1, 2, 3]],
          [1, 2, 1, [1, 2, 3]],
          [3, 3, 2, [1, 2, 3]]
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

      .when('the values array changed to [2, 4, 6]', ({ TestComponent }, result) => {
        result.rerender(createElement(TestComponent, { values: [2, 4, 6] }));

        return result;
      })
      .then('textContent should match', (_, result) => {
        expect(result.container).toHaveProperty('textContent', 'Result is 12.Click me (2)');
      })
      .and('reducer should not have been called', ({ reducer }) => {
        expect(reducer.mock.callCount()).toBe(6);
      })
      .and('reducer should have been called with matching arguments', ({ reducer }) => {
        expect(reducer.mock.calls.map(call => call.arguments)).toEqual([
          [0, 1, 0, [1, 2, 3]],
          [1, 2, 1, [1, 2, 3]],
          [3, 3, 2, [1, 2, 3]],
          [0, 2, 0, [2, 4, 6]],
          [2, 4, 1, [2, 4, 6]],
          [6, 6, 2, [2, 4, 6]]
        ]);
      }),
  nodeTest
);
