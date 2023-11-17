# signals-react-safe

[Signals]([@preact/signals](https://github.com/preactjs/signals)) is a state management library from the Preact team.

The team provides a react compatibility library [signals-react](https://github.com/preactjs/signals/tree/main/packages/react), but it comes with a very large downside: It alters React's internals. This is a [big no-no](https://github.com/facebook/react/issues/26704#issuecomment-1522044060) for mainting compatibility with future versions of React, creating risk for your project. It also breaks compatibility with [Next.js](https://nextjs.org/), which is a pretty good and popular React framework.

This library still lets you get the biggest benefit of Signals. When you render a signal directly within your JSX/TSX it creates a text node that updates when the signal updates, skipping the re-render of the component you render it within.

But… when using this library you would now need to use one of the [new hooks](#api) for reading the value of a signal directly. So instead of reading `mySignal.value` somewhere in your component, use `useSignalValue(mySignal)` instead.

IMHO, this is also helps readibility since it makes it more clear what can cause a component to re-render.

[Live editable demo](https://codesandbox.io/s/signals-react-safe-demo-jmcwst?file=/src/Counter.tsx)

## Install

```bash
npm install signals-react-safe
```

## Usage Example

`mySignals.ts`

```ts
import { signal } from 'signals-react-safe';

export counter = signal(0);
```

`Counter.tsx` (this component does NOT re-render when the signal updates, which is more performant)

```tsx
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

`MixedCounter.tsx` (this component does re-render when the signal updates, which allows the value to be combined with non-signal values)

```tsx
import { useState } from "react";
import { counter } from "./mySignals";

export function MixedCounter() {
  const counterValue = useSignalValue(counter);
  const [myCounter, setMyCounter] = useState(0);

  return (
    <div>
      <div>Summed: {counterValue + myCounter}</div>
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
- Copy/pasted hooks from [@preact/signals-react](https://github.com/preactjs/signals/blob/main/packages/react): `useSignal`, `useComputed`, `useSignalEffect`.
- New hooks unique to this library: `useSignalValue`, `useSignalAndValue`, `useComputedValue`.

### `useSignalValue(signal)`

Takes as input an existing signal, typically imported into your module from elsewhere in your app. If you want your component to create its own signal, use [`useSignal`](https://github.com/preactjs/signals/tree/main/packages/react#hooks) instead.

It returns the value stored in the signal. When the signal's value changes, this hook will trigger a component re-render and return the new value.

Use this hook when you need to access the value stored in the signal, e.g. triggering a useEffect, or combining with non-signal values.

If you want to combine the value with other signal values, consider using `useComputed` or `useComputedValue` to be more performant.

Example:
```tsx
import {count} from '../signals';
function Count() {
  const countValue = useSignalValue(count);
  useEffect(() => {
    localStorage['count'] = `#{countValue}`;
  }, [countValue]);
  return <div>{count} <button onClick={() => count.value++}>Add one</button></div>
}
```

### `useSignalAndValue`

Creates a signal and returns it, along with its value. Triggers a component re-render in order to return the latest value. Use this to replace `useSignal` if you need to read the value of a component's signal within the component.

It returns an array with two elements:
1. The signal.
2. Its value.

Example: 
```tsx
function MyCounter() {
  const [count, countValue] = useSignalAndValue(0);
  useEffect(() => {
    localStorage['count'] = `#{countValue}`;
  }, [countValue]);
  return <div>{count} <button onClick={() => count.value++}>Add one</button></div>;
}
```

### `useComputedValue`

Take a function as its parameter and returns a value. It's useful when that function uses multiple signals. 

A new value will be generated if any of the referenced signals are updated, causing the component to re-render.

Example:
```tsx
import {count} from '../signals';
function MyMultiplier() {
  const multiplier = useSignal(1);
  const multipliedValue = useComputedValue(() => multiplier.value * count.value);
  useEffect(() => {
    localStorage['multiplied'] = `#{multipliedValue}`;
  }, [countValue]);
  return <div>{multiplier} <button onClick={() => multiplier.value++}>Add one</button></div>;
}
```

# Performance

The new hooks that directly return values will trigger re-renders of the component. This would also happen if you read a signal's value inside a component when using [@preact/signals-react](https://github.com/preactjs/signals/tree/main/packages/react). If you want to avoid that re-render, place your signal directly in your JSX.

# Author

Created by [Jon Abrams](https://threads.net/jon.abrams) (2023)

# Attributions

Contains code from [Preact Signals](https://github.com/preactjs/signals)

Idea inspired by [satoshi-cyber](https://github.com/satoshi-cyber)'s [suggestion](https://github.com/vercel/next.js/issues/45054#issuecomment-1694791734).
