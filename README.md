# signals-react-safe

[Signals]([@preact/signals](https://github.com/preactjs/signals)) is a state management library from the Preact team.

The team provides a react compatibility library (signals-react)[https://github.com/preactjs/signals/tree/main/packages/react], but it comes with a very large downside: It alters React's internals. This is a [big no-no](https://github.com/facebook/react/issues/26704#issuecomment-1522044060) for mainting compatibility with future versions of React, creating risk for your project. It also breaks compatibility with [Next.js](https://nextjs.org/), which is a pretty good and popular React framework.

This library still lets you get the biggest benefit of Signals. When you render a signal directly within your JSX/TSX it creates a text node that updates when the signal updates, skipping the re-render of the component you render it within.

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

The new hooks that directly return values will trigger re-renders of the component. This would also happen if you read a signal's value inside a component. If you want to avoid that re-render, place your signal directly in your JSX.

# Author

Created by [Jon Abrams](https://threads.net/jon.abrams) (2023)

# Attributions

Contains code from [Preact Signals](https://github.com/preactjs/signals)

Idea inspired by [satoshi-cyber](https://github.com/satoshi-cyber)'s [suggestion](https://github.com/vercel/next.js/issues/45054#issuecomment-1694791734).
