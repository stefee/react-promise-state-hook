import * as React from "react";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 */
export enum PromiseStatus {
  NOT_STARTED,
  PENDING,
  REJECTED,
  FULFILLED,
}

/**
 * The possible result states as returned by {@link usePromiseState} are expressed by this type.
 *
 * This is useful for "type narrowing" in TypeScript usages. For example, if `result.status`
 * is `PromiseStatus.FULFILLED` then the type of `result.value` can be inferred as a
 * concrete type (the return type of the async callback).
 */
export type PromiseState<Resolved, Rejected> =
  | {
      status: PromiseStatus.NOT_STARTED;
      value: null;
      err: null;
    }
  | {
      status: PromiseStatus.PENDING;
      value: null;
      err: null;
    }
  | {
      status: PromiseStatus.PENDING;
      value: Resolved;
      err: null;
    }
  | {
      status: PromiseStatus.PENDING;
      value: null;
      err: Rejected;
    }
  | {
      status: PromiseStatus.REJECTED;
      value: null;
      err: Rejected;
    }
  | {
      status: PromiseStatus.FULFILLED;
      value: Resolved;
      err: null;
    };

const promiseStateReducer = <Resolved, Rejected>(
  prev: PromiseState<Resolved, Rejected>,
  next: PromiseState<Resolved, Rejected>
): PromiseState<Resolved, Rejected> => {
  if (next.status === PromiseStatus.PENDING) {
    if (prev.status === PromiseStatus.REJECTED) {
      return { status: next.status, value: null, err: prev.err };
    } else if (prev.status === PromiseStatus.FULFILLED) {
      return { status: next.status, value: prev.value, err: null };
    } else {
      return { status: next.status, value: null, err: null };
    }
  }
  if (next.status === PromiseStatus.REJECTED) {
    return { status: next.status, value: null, err: next.err };
  }
  if (next.status === PromiseStatus.FULFILLED) {
    return { status: next.status, value: next.value, err: null };
  }
  return { status: PromiseStatus.NOT_STARTED, value: null, err: null };
};

/**
 * Returns a wrapped version of the given async function that will never throw, and a stateful
 * object with the state of the promise returned from the function (NOT_STARTED, PENDING, FULFILLED,
 * REJECTED) and its resolved value or rejected value.
 *
 * The given async function can be memoized across renders using React.useCallback to prevent
 * unnecessary renders. If the function is not memoized, the returned wrapper function will have
 * a different identity on every render.
 *
 * The returned wrapper function is de-bounced across calls, meaning if it is called twice without
 * waiting for the first call to complete, the second call will have no effect.
 */
export const usePromiseState = <Params extends unknown[], Resolved>(
  asyncFn: (...params: Params) => Promise<Resolved>,
  { onError = console.error }: { onError?: (err: unknown) => void } = {}
): [(...params: Params) => Promise<void>, PromiseState<Resolved, unknown>] => {
  const isPending = React.useRef<boolean>(false);
  const isMounted = React.useRef<boolean>(true);

  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const [result, dispatch] = React.useReducer<
    (
      prev: PromiseState<Resolved, unknown>,
      next: PromiseState<Resolved, unknown>
    ) => PromiseState<Resolved, unknown>
  >(promiseStateReducer, {
    status: PromiseStatus.NOT_STARTED,
    value: null,
    err: null,
  });

  const call = React.useCallback(
    async (...params: Params) => {
      if (isPending.current) {
        return;
      }
      isPending.current = true;
      if (isMounted.current) {
        dispatch({ status: PromiseStatus.PENDING, value: null, err: null });
      }
      try {
        const value = await asyncFn(...params);
        if (isMounted.current) {
          dispatch({ status: PromiseStatus.FULFILLED, value, err: null });
        }
      } catch (err: unknown) {
        onError(err);
        if (isMounted.current) {
          dispatch({ status: PromiseStatus.REJECTED, value: null, err });
        }
      }
      isPending.current = false;
    },
    [asyncFn, onError]
  );

  return [call, result];
};

/**
 * Create a {@link usePromiseState} hook with predefined default options.
 */
export const createUsePromiseState =
  (predefinedOptions: { onError?: (err: unknown) => void }) =>
  <Params extends unknown[], Resolved>(
    asyncFn: (...params: Params) => Promise<Resolved>,
    options = predefinedOptions
  ): [(...params: Params) => Promise<void>, PromiseState<Resolved, unknown>] =>
    usePromiseState(asyncFn, options);
