import {
  Signal,
  batch,
  computed,
  effect,
  signal,
  untracked,
  type ReadonlySignal,
} from "@preact/signals-core";
import { ReactElement } from "react";
import { useSignal } from "./hooks";

export * from "./hooks";

export {
  Signal,
  batch,
  computed,
  effect,
  signal,
  untracked,
  type ReadonlySignal,
};

const ReactElemType = Symbol.for("react.element"); // https://github.com/facebook/react/blob/346c7d4c43a0717302d446da9e7423a8e28d8996/packages/shared/ReactSymbols.js#L15

function SignalValue({ data }: { data: Signal }) {
  useSignal(data);
  return data.value;
}

Object.defineProperties(Signal.prototype, {
  $$typeof: { configurable: true, value: ReactElemType },
  type: { configurable: true, value: SignalValue },
  props: {
    configurable: true,
    get() {
      return { data: this };
    },
  },
  ref: { configurable: true, value: null },
});

declare module "@preact/signals-core" {
  interface Signal extends ReactElement {}
}
