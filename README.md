# `@klaasman/pubsub-channel`

Hook to communicate state between windows such as a parent window and an iframe.

## usage

```tsx
import {
  createPubsubChannel,
  usePubsubChannel,
} from "@klaasman/pubsub-channel";

const channel = createPubsubChannel<number>("number of clicks");

/**
 * Listen to messages on the current window
 */
channel.subscribe((data) => {
  console.log(data);
});

/**
 * Post a message to a target window
 */
channel.publish("hello world", iframe.contentWindow);

/**
 * Hook to listen to a channel
 */
function Component() {
  const [data, setData] = usePubsubChannel(channel, 0);

  return (
    <div>
      <button onClick={() => setData(data + 1, window.parentWindow)}>
        click
      </button>

      <p>nb of clicks: {data}</p>
    </div>
  );
}
```
