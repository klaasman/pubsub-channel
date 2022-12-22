import { useCallback, useEffect, useRef, useState } from "react";

export type PubsubChannel<T> = {
  subscribe: (callback: (data: T) => void) => () => void;
  publish: (payload: T, target: Window) => void;
};

/**
 * Creates a pubsub channel that can be used to publish and subscribe to
 * messages across windows (e.g. window<->iframe).
 *
 * @param event The event name to use for the channel
 */
export function createPubsubChannel<T>(event: string): PubsubChannel<T> {
  const id = Math.random().toString(36).substr(2, 9);
  return {
    publish: (payload: T, target: Window) => {
      const source = `${id}:${window.location.href}`;
      target.postMessage(
        { source, event, payload: JSON.stringify(payload) },
        "*"
      );
    },

    subscribe: (callback: (data: T) => void) => {
      function handleMessage(evt: MessageEvent) {
        const isMatchingSource = evt?.data?.source?.match(
          new RegExp(`^${id}:`)
        );
        const isMatchingEvent = evt?.data?.event === event;

        if (isMatchingSource && isMatchingEvent) {
          callback(JSON.parse(evt.data.payload));
        }
      }

      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    },
  };
}

export function usePubsubChannel<T>(
  channel: PubsubChannel<T>,
  initialValue?: T,
  callback?: (value: T) => void
) {
  const [value, setValue] = useState<T | undefined>(initialValue);
  const pageRef = useRef(value);
  pageRef.current = value;

  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    return channel.subscribe((payload) => {
      if (value !== payload) {
        setValue(payload);
        callbackRef.current?.(payload);
      }
    });
  }, [value, channel]);

  const publishState = useCallback(
    (payload: T, target: Window | HTMLIFrameElement) => {
      channel.publish(payload, getWindow(target));

      if (payload !== value) {
        setValue(payload);
      }
    },
    [value, channel]
  );

  return [value, publishState] as const;
}

function getWindow(target: Window | HTMLIFrameElement): Window {
  const window =
    target instanceof HTMLIFrameElement ? target.contentWindow : target;

  if (!window) throw new Error("Could not get window from target");

  return window;
}
