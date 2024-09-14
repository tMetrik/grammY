# grammY Adapter for tMetrik

## Usage

```ts
// npm install @tmetric/grammy
import { Tmetrik } from "@tmetric/grammy";

bot.use(new Tmetrik("https://tmetrik-endpoint"));

// or with parameters
const tmetrik = new Tmetrik("https://tmetrik-endpoint", {
  threshold: 30,
  timeout: 5_000,
  log: false,
});
bot.use(tmetrik);
```

## Parameters

- `threshold` - The maximum number of updates to dispatch at once. Defaults to
  10,000.
- `timeout` - The maximum duration to wait (in milliseconds) before dispatching
  updates. Defaults to 10,000 (10 seconds). Use a smaller duration to for near
  real-time dispatching of updates.
- `log` - Whether logging should be enabled. Defaults to true.

## Serverless Environments

On serverless environments like Cloudflare Workers or Deno Deploy, the
`threshold` option must be set to 1.
