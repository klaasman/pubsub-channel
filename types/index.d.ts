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
export declare function createPubsubChannel<T>(event: string): PubsubChannel<T>;
export declare function usePubsubChannel<T>(channel: PubsubChannel<T>, initialValue?: T, callback?: (value: T) => void): readonly [T, (payload: T, target: Window | HTMLIFrameElement) => void];
