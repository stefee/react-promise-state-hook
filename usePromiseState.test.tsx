import "@testing-library/jest-dom";
import * as React from "react";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {usePromiseState, PromiseState, PromiseStatus} from "./usePromiseState";

const getMockComponentStates = (promise: () => Promise<string>) => {
  const states: PromiseState<string, unknown>[] = [];
  const unmountObj: {unmount: () => void} = {unmount: () => undefined};
  const Component = () => {
    const [call, current, unmount] = usePromiseState(promise, {
      onError: () => undefined,
    });
    unmountObj.unmount = unmount;
    states.push({...current});
    return <button onClick={call}>Click Me</button>;
  };
  render(<Component />);
  return {
    states,
    unmount: unmountObj.unmount,
    callAction: () => userEvent.click(screen.getByRole("button")),
  };
};

it("passes parameters through to the wrapper function", async () => {
  const Component = () => {
    const [call, state] = usePromiseState(
      async (val1: number, val2: number) => {
        return {val1, val2};
      },
      {onError: () => undefined},
    );
    if (state.status === PromiseStatus.FULFILLED) {
      return (
        <p>
          The values are {state.value.val1} and {state.value.val2}
        </p>
      );
    } else {
      return <button onClick={() => call(42, 43)}>Click Me</button>;
    }
  };
  render(<Component />);
  userEvent.click(screen.getByRole("button"));
  await waitFor(() =>
    expect(screen.queryByText("The values are 42 and 43")).toBeInTheDocument(),
  );
});

it("is generic over the resolved type", async () => {
  const Component = () => {
    const [call, current] = usePromiseState(
      async () => {
        await new Promise((res) => setTimeout(res, 100));
        return 42;
      },
      {onError: () => undefined},
    );
    if (current.status === PromiseStatus.FULFILLED) {
      return <p>Value is {current.value.toFixed(3)}</p>;
    } else {
      return <button onClick={call}>Click Me</button>;
    }
  };
  render(<Component />);

  userEvent.click(screen.getByRole("button"));
  await waitFor(() =>
    expect(screen.queryByText("Value is 42.000")).toBeInTheDocument(),
  );
});

it("returns correct state on success", async () => {
  const promise = jest.fn(async () => {
    await new Promise((res) => setTimeout(res, 100));
    return "Success";
  });
  const {states, callAction} = getMockComponentStates(promise);

  callAction();
  await waitFor(() => expect(states).toHaveLength(3));
  expect(promise).toHaveBeenCalledTimes(1);
  expect(states).toEqual([
    {status: PromiseStatus.NOT_STARTED, err: null, value: null},
    {status: PromiseStatus.PENDING, err: null, value: null},
    {status: PromiseStatus.FULFILLED, err: null, value: "Success"},
  ]);

  callAction();
  expect(promise).toHaveBeenCalledTimes(2);
  await waitFor(() => expect(states).toHaveLength(5));
  expect(states).toEqual([
    {status: PromiseStatus.NOT_STARTED, err: null, value: null},
    {status: PromiseStatus.PENDING, err: null, value: null},
    {status: PromiseStatus.FULFILLED, err: null, value: "Success"},
    {status: PromiseStatus.PENDING, err: null, value: "Success"},
    {status: PromiseStatus.FULFILLED, err: null, value: "Success"},
  ]);
});

it("returns correct state on failure", async () => {
  const err = new Error("Boom!");
  const promise = jest.fn(async () => {
    await new Promise((res) => setTimeout(res, 100));
    throw err;
  });
  const {states, callAction} = getMockComponentStates(promise);

  callAction();
  await waitFor(() => expect(states).toHaveLength(3));
  expect(promise).toHaveBeenCalledTimes(1);
  expect(states).toEqual([
    {status: PromiseStatus.NOT_STARTED, err: null, value: null},
    {status: PromiseStatus.PENDING, err: null, value: null},
    {status: PromiseStatus.REJECTED, err, value: null},
  ]);

  callAction();
  await waitFor(() => expect(states).toHaveLength(5));
  expect(promise).toHaveBeenCalledTimes(2);
  expect(states).toEqual([
    {status: PromiseStatus.NOT_STARTED, err: null, value: null},
    {status: PromiseStatus.PENDING, err: null, value: null},
    {status: PromiseStatus.REJECTED, err, value: null},
    {status: PromiseStatus.PENDING, err, value: null},
    {status: PromiseStatus.REJECTED, err, value: null},
  ]);
});

it("doesn't set status after hook is unmounted", async () => {
  const promise = jest.fn(async () => {
    await new Promise((res) => setTimeout(res, 100));
    return "Success";
  });
  const {states, callAction, unmount} = getMockComponentStates(promise);

  callAction();
  await waitFor(() => expect(states).toHaveLength(3));
  expect(promise).toHaveBeenCalledTimes(1);
  expect(states).toEqual([
    {status: PromiseStatus.NOT_STARTED, err: null, value: null},
    {status: PromiseStatus.PENDING, err: null, value: null},
    {status: PromiseStatus.FULFILLED, err: null, value: "Success"},
  ]);

  unmount();

  callAction();
  await waitFor(() => expect(states).toHaveLength(3));
  expect(promise).toHaveBeenCalledTimes(2);
  expect(states).toEqual([
    {status: PromiseStatus.NOT_STARTED, err: null, value: null},
    {status: PromiseStatus.PENDING, err: null, value: null},
    {status: PromiseStatus.FULFILLED, err: null, value: "Success"},
  ]);
});

it("doesn't call promise again if previous call is pending", async () => {
  const promise = jest.fn(async () => {
    await new Promise((res) => setTimeout(res, 100));
    return "Success";
  });
  const {states, callAction} = getMockComponentStates(promise);

  callAction();
  callAction();
  callAction();
  await waitFor(() => expect(states).toHaveLength(3));
  expect(promise).toHaveBeenCalledTimes(1);

  callAction();
  await waitFor(() => expect(states).toHaveLength(5));
  expect(promise).toHaveBeenCalledTimes(2);
});
