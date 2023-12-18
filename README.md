# signals-react-safe

[Signals](<[@preact/signals](https://github.com/preactjs/signals)>) is a state management library from the Preact team.

The team provides a react compatibility library [signals-react](https://github.com/preactjs/signals/tree/main/packages/react), but it comes with a very large downside: It alters React's internals. This is a [big no-no](https://github.com/facebook/react/issues/26704#issuecomment-1522044060) for mainting compatibility with future versions of React, creating risk for your project. It also [breaks compatibility](https://github.com/preactjs/signals/issues/429) with [Next.js](https://nextjs.org/), which is a pretty good and popular React framework.

This library still lets you get the splashiest benefit of Signals. When you render a signal directly within your JSX/TSX it creates a text node that updates when the signal updates, skipping the re-render of the component you render it within.

If you need to read the signal's value in your components, use this library's [hooks](#api). For example, in addition to reading `mySignal.value` somewhere in your component, add `useSignal(mySignal)` to the top of your component so that updates to `mySignal` trigger a re-render.

IMHO, this is also helps readibility since it makes it more clear what can cause a component to re-render.

Note: Reading signal values in your components is a very normal thing to do, don't feel ashamed doing it. React's designed to keep component re-renders as performant as possible.

[Live editable demo](https://codesandbox.io/s/signals-react-safe-demo-v2-s4rxl5?file=/src/Counter.tsx)

## Install

```bash
npm install signals-react-safe
```

## Usage Example

`mySignals.ts`

```ts
import { signal } from "signals-react-safe";

export const counter = signal(0);
```

`Counter.tsx` This component does NOT re-render when the signal updates, which is theoretically more performant.

```jsx
import { counter } from "./mySignals";

export function Counter() {
  return (
    <div>
      <div>Current Count: {counter}</div>
      <button onClick={() => counter.value++}>Add One</button>
    </div>
  );
}
```

`MixedCounter.tsx` This component does re-render when the signal updates, which allows the value to be combined with non-signal values, and is generally more flexible.

```jsx
import { useState } from "react";
import { counter } from "./mySignals";

export function MixedCounter() {
  useSignal(counter);
  const [myCounter, setMyCounter] = useState(0);

  return (
    <div>
      <div>Summed: {counter.value + myCounter}</div>
      <button onClick={() => counter.value++}>Add One to signal counter</button>
      <button onClick={() => setMyCounter(myCounter + 1)}>
        Add One to useState counter
      </button>
    </div>
  );
}
```

# API

This library provides a bunch of exported function:

- Re-exports from the [core Signals library](https://github.com/preactjs/signals): `signal`, `computed`, `effect`.
- Copy/pasted hook from [@preact/signals-react](https://github.com/preactjs/signals/blob/main/packages/react): `useSignalEffect`.
- New hooks unique to this library: `useSignal`, `useComputed`.

# Note about API change in version 2.0

With the release of `signals-react-safe` 2.0.0, the API has been simplified, but has unfortunately led to a breaking change, hence the major version bump.

I've removed `useSignalValue`, `useSignalAndValue`, and `useComputedValue`. After using this library for a bit, I got tired having to make additional variables when using imported signals.

Instead, as of 2.0.0, use `useSignal(mySignal)` to have your component re-render on updates to an imported signal. It's also overloaded to create a signal, as it did before, but will cause the component to re-render by default on any updates to the signal. This new re-render behavior can be disabled on a case-by-case need.

If you don't want to go through the trouble of upgrading, or want a migration path. You can continue to use v1's `useSignalValue` to trigger re-renders, but choose to not read its return value.

Example using v1 of this library:

```jsx
import { countSignal } from "../signals";
function Count() {
  useSignalValue(countSignal); // re-renders Count whenever countSignal updates
  useEffect(() => {
    localStorage["count"] = `${countSignal.value}`;
  }, [count.value]);

  return (
    <div>
      {count} <button onClick={() => countSignal.value++}>Add one</button>
    </div>
  );
}
```

### `useSignal(signal: Signal)`

Takes as input an existing signal, typically imported into your module from elsewhere in your app. If you want your component to create its own signal, use [`useSignal`](https://github.com/preactjs/signals/tree/main/packages/react#hooks) instead.

Causes your component to re-render whenever the signal updates.

It does not return a value. You can read your signal's value directly from the signal.

Example:

```jsx
import { countSignal } from "../signals";
function Count() {
  useSignal(countSignal);
  useEffect(() => {
    localStorage["count"] = `${countSignal.value}`;
  }, [count.value]);

  return (
    <div>
      {count} <button onClick={() => countSignal.value++}>Add one</button>
    </div>
  );
}
```

### `useSignal(initialValue: any, skipRenders?: boolean): Signal`

Creates a new signal for your component, using the initialValue.

By default, any updates to this signal will cause your component to re-render, making it safe to read its value anywhere in the component. Pass in `true` as the second parameter to turn this off, which can help you gain performance if your component doesn't read the signal's value directly.

Note: This signal looks and behaves very similarly to the hook provided by the official [@preact/signals-react](https://github.com/preactjs/signals/tree/main/packages/react) library, but with the exception that it re-renders components on updates by default. This is because this library does not auto-track signal dependencies within components, as that would require altering React internals. So it's on you to opt-out of the re-rending behavior as needed.

Example:

```jsx
function Count() {
  const countSignal = useSignal(0);
  useEffect(() => {
    localStorage["count"] = `${countSignal.value}`;
  }, [count.value]);

  return (
    <div>
      {count} <button onClick={() => countSignal.value++}>Add one</button>
    </div>
  );
}
```

### `useComputed(cb: () => void)`

Takes a function as its parameter and returns a signal. The returned signal will update if any of the signals used in the callback function update.

By default, any time this signal's value updates your component will re-render, making it safe to read its value anywhere in the component. Pass in `true` as the second parameter to turn off component re-rending, which can help you gain performance if your component doesn't read the signal's value directly.

Example:

```jsx
import { count } from "../signals";

function MyMultiplier() {
  const multiplier = useSignal(1, true); // no need to re-render
  const multiplied = useComputed(() => multiplier.value * count.value);
  useEffect(() => {
    localStorage["multiplied"] = `${multiplied.value}`;
  }, [multiplied.value]);
  return (
    <div>
      {multiplied} <button onClick={() => multiplier.value++}>Add one</button>
    </div>
  );
}
```

### useSignalEffect(cb: () => (void | () => void))

Executes the given callback function. Re-executes if any the signals referenced within the callback update.

Have your callback return another callback to execute when the component unmounts.

Use this as a more performant alternative to React's `useEffect`, since it doesn't require your component to re-render for it to execute.

Example:

```jsx
import { count } from "../signals";

function MyMultiplier() {
  const multiplier = useSignal(1, true); // no need to re-render
  const multiplied = useComputed(() => multiplier.value * count.value, true); // no need to re-render
  useSignalEffect(() => {
    localStorage["multiplied"] = `${multiplied.value}`;
  });
  return (
    <div>
      {multiplied} <button onClick={() => multiplier.value++}>Add one</button>
    </div>
  );
}
```

# FAQ

**Isn't the whole point of Signals is that it never re-renders your components?**

No, not never. It is a nice feature that you can render a signal directly in your component's JSX, skipping re-renders. This library still supports that!

But it's also an officially provided behavior that if a component reads a signal's value as part of its render function, then any future updates to that signal will cause the component to re-render. This library makes that behavior more explicit, requiring you to register a that a component depends on a signal.

**So I need to add a hook whenever I use a signal?**

Nope! Only if you _read_ the signal's value _during render_.

When you **do NOT** need to use the `useSignal` hook from this library:

- Rendering a signal directly in your JSX.
- Passing a signal as a prop to another component.
- Reading a signal's value in either this library's `useComputed` or `useSignalEffect` hooks.
- Reading/writing a signal's value in an event handler.

# Author

Created by [Jon Abrams](https://threads.net/jon.abrams) (2023)

# Attributions

Contains code from [Preact Signals](https://github.com/preactjs/signals)

Idea inspired by [satoshi-cyber](https://github.com/satoshi-cyber)'s [suggestion](https://github.com/vercel/next.js/issues/45054#issuecomment-1694791734).
