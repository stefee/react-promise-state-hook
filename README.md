# react-promise-state-hook

The `usePromiseState` hook helps with handling asynchronous UI actions by providing a React state object for a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) returned from a given function, including its **status** (`NOT_STARTED`, `PENDING`, `FULFILLED` or `REJECTED`) and its **resolved** or **rejected** value. The API is heavily inspired by [Apollo GraphQL `useQuery` hook](https://www.apollographql.com/docs/react/data/queries/).

Install:

```sh
npm install react-promise-state-hook
```

Alternatively, you may copy [the source code](https://github.com/stefee/react-promise-state-hook/blob/main/usePromiseState.ts) directly into your project as this library is published under the Unlicense license.

Usage example:

```tsx
import * as React from "react";
import {usePromiseState, PromiseStatus} from "react-promise-state-hook";

const MyApp = () => {
  const [fetchCustomer, fetchCustomerState] = usePromiseState(
    React.useCallback(async () => {
      // do asynchronous stuff here
    }, []),
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

## Options

By default, any errors thrown by an async callback will be caught and logged using [`console.error`](https://developer.mozilla.org/en-US/docs/Web/API/console/error).

The `createUsePromiseState` function allows you to set a custom `onError` handler:

```tsx
import {createUsePromiseState} from "react-promise-state-hook";

const handleError = (error: unknown) => {
  // do error reporting here
};

export const usePromiseState = createUsePromiseState({onError: handleError});
```

```tsx
const [fetchCustomer, fetchCustomerState] = usePromiseState(
  React.useCallback(async () => {
    // do asynchronous stuff here
  }, []),
);
```

You can override the `onError` handler when calling `usePromiseState`:

```tsx
const [fetchCustomer, fetchCustomerState] = usePromiseState(
  React.useCallback(async () => {
    // do asynchronous stuff here
  }, []),
  {
    onError: React.useCallback((error: unknown) => {
      // do error reporting here
    }, []),
  },
);
```
