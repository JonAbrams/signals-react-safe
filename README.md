# signals-react-safe

[Signals](@preact/signals) is a state management library from the Preact team.

The team provides a react compatibility library (signals-react)[@preact/signals-react], but it comes with a very large downside: It alters React's internals. This is a [big no-no](https://github.com/facebook/react/issues/26704#issuecomment-1522044060) for mainting compatibility with future versions of React, creating risk for your project. It also broke compatibility with [Next.js](https://nextjs.org/), which is a pretty good and popular React framework.

## Usage Example

`mySignals.ts`

```ts
import {signal} from 'signals-react-safe';

export counter = signal(0);
```

`Counter.tsx`

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

`MixedCounter.tsx`

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

- Re-exports from the [core Signals library](https://github.com/preactjs/signals/): `signal`, `computed`, `effect`.
- Copy/pasted hooks from [@preact/signals-react](https://github.com/preactjs/signals/blob/main/packages/react): `useSignal`, `useComputed`, `useSignalEffect`.
- New hooks unique to this library: `useSignalValue`, `useSignalAndValue`, `useComputedValue`.

# Author

Created by [Jon Abrams](https://threads.net/jon.abrams) (2023)

# Attributions

Contains code from [Preact Signals](https://github.com/preactjs/signals)
