import React, { Fragment } from 'react';
import { useReduceMemo } from 'use-reduce-memo';

const App = () => {
  let numCalled = 0;

  const result = useReduceMemo(
    [1, 2, 3],
    (sum, value) => {
      numCalled++;

      return sum + value;
    },
    0
  );

  return (
    <Fragment>
      <p>
        Summation of <code>[1, 2, 3]</code> is {result}.
      </p>
      <p>Number of times called: {numCalled}</p>
    </Fragment>
  );
};

export default App;
