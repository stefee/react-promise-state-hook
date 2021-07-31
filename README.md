# react-promise-state-hook

The `usePromiseState` hook helps with handling asynchronous UI actions by providing a React state object for a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) returned by a given function, including its **status** (`NOT_STARTED`, `PENDING`, `FULFILLED` or `REJECTED`) and its **resolved** or **rejected** value.

Install:

```sh
npm install react-promise-state-hook
```

Alternatively, you may copy [the source code](https://github.com/stefee/react-promise-state-hook/blob/main/usePromiseState.ts) directly into your project as this library is published under The Unlicense.

Usage example:

```jsx
import * as React from "react";
import {usePromiseState, PromiseStatus} from "react-promise-state-hook";

const MyApp = () => {
  const [fetchCustomer, fetchCustomerState] = usePromiseState(
    React.useCallback(async () => {
      // do asynchronous stuff here
    }),
    {onError: console.error},
  );

  if (fetchCustomerState.status === PromiseStatus.FULFILLED) {
    return <Customer data={fetchCustomerState.value} />;
  }

  return (
    <div>
      <button
        onClick={fetchCustomer}
        disabled={fetchCustomerState.status === PromiseStatus.PENDING}
      >
        Start
      </button>
      {fetchCustomerState.status === PromiseStatus.REJECTED && (
        <div>Error: {fetchCustomerState.err}</div>
      )}
    </div>
  );
};
```

You may also use the factory method to avoid repeating the second argument on each usage:

```jsx
import {createUsePromiseState} from "react-promise-state-hook";

export const usePromiseState = createUsePromiseState({onError: console.error});
```

```jsx
const [fetchCustomer, fetchCustomerState] = usePromiseState(
  React.useCallback(async () => {
    // do asynchronous stuff here
  }),
);
```
