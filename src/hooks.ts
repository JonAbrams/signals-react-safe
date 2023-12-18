import { Signal, computed, effect } from "@preact/signals-core";
import { useEffect, useMemo, useRef, useState } from "react";

type NotSignal<T> = T extends Signal ? never : T;

/**
 * Creates a signal for your component.
 * @param initialData Initial value of the signal.
 * @param skipRenders If true, the signal will not trigger re-renders on updates.
 * @returns A new signal for your component.
 * @version 2.0.0
 * @see https://github.com/JonAbrams/signals-react-safe
 */
export function useSignal<T>(
  initialData: NotSignal<T>,
  skipRenders?: boolean
): Signal<T>;

/**
 * Listens to the given signal(s) to re-render your component on updates.
 * @param signals Signals to listen to for re-renders.
 * @returns void
 * @version 2.0.0
 * @see https://github.com/JonAbrams/signals-react-safe
 */
export function useSignal<T extends Signal[]>(...signals: T): void;

export function useSignal<T>(
  data: T | Signal,
  skipRenders?: boolean | Signal,
  ...rest: Signal[]
) {
  // If the first parameter is a signal, this hook's sole purpose is to
  // trigger re-renders on signal updates.
  // The rest of the parameters are then assumed to also be signals.
  const [, setState] = useState<any[]>([]);
  const allSignals = [data] as Signal[];
  if (skipRenders) allSignals.push(skipRenders as Signal, ...rest);
  useEffect(() => {
    if (!(data instanceof Signal)) return;
    return effect(() => {
      const allValues = allSignals.map((signal) => signal.value);
      setState(allValues);
    });
  }, [...allSignals]);

  // // Otherwise, the first parameter is the initial value of a new signal to be returned.
  const [signal] = useState(() => new Signal<T>(data as T));
  const [, setValue] = useState<T>(signal.value);
  useEffect(() => {
    if (data instanceof Signal) return;
    return effect(() => {
      if (skipRenders) return;
      setValue(signal.value);
    });
  }, [signal]);

  return data instanceof Signal ? void 0 : signal;
}

/**
 * Creates a computed signal for your component.
 * @param compute A callback that returns a value based on other signals' values.
 * @param skipRender If true, the signal will not trigger re-renders on updates.
 * @returns The computed signal.
 * @version 2.0.0
 * @see https://github.com/JonAbrams/signals-react-safe
 */
export function useComputed<T>(
  compute: () => T,
  skipRender?: boolean
): Signal<T> {
  const $compute = useRef(compute);
  $compute.current = compute;
  const memoizedComputed = useMemo(
    () => computed<T>(() => $compute.current()),
    []
  );
  const [, setValue] = useState<T>();
  useEffect(() => {
    return effect(() => {
      if (skipRender) return;
      setValue(compute());
    });
  }, [memoizedComputed]);
  return memoizedComputed;
}

/**
 * Executes the given callback and re-executes it on update of any referenced signals.
 * @param cb Callback to execute. Have your callback return an additional callback to clean up on component unmount.
 * @version 2.0.0
 * @see https://github.com/JonAbrams/signals-react-safe
 */
export function useSignalEffect(cb: () => void | (() => void)): void {
  const callback = useRef(cb);
  callback.current = cb;
  useEffect(() => {
    return effect(() => callback.current());
  }, []);
}
