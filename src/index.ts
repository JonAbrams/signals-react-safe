import { Signal } from "@preact/signals-core";
import { useSignalValue } from "./hooks";

export * from "@preact/signals-core";
export * from "./hooks";

const ReactElemType = Symbol.for("react.element"); // https://github.com/facebook/react/blob/346c7d4c43a0717302d446da9e7423a8e28d8996/packages/shared/ReactSymbols.js#L15

function SignalValue({ data }: { data: Signal }) {
  return useSignalValue(data);
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
