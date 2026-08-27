#### ⚠️ Things to keep in mind when using Resource

1. **Still an experimental API** (as of Angular 21: `resource` since v19.0, `httpResource` since v19.2). The API may still change between majors - read the changelog before upgrading, and think twice before committing it to long-term production.

2. **READ only, never for mutations (POST/PUT/DELETE)**

- Resource will **cancel the running loader** when params change or the component is destroyed - a mutation cancelled midway can leave half-written data on the server.
- Mutations should be explicit actions: call the service in an event handler as usual.

3. **`value()` will THROW when status is `'error'`**

- Read safely with `hasValue()` (type guard) or branch on `error()` / `isLoading()` as in the demo above.
- `defaultValue` only helps avoid `undefined` while the data **hasn't loaded yet** - it does not "catch" the error state.

4. **Remember to use `abortSignal` in hand-written loaders**

- With `httpResource`/`rxResource`, cancellation is handled for you; with `resource()` + `fetch`, you must pass `{signal: abortSignal}` for the old request to be truly cancelled at the network layer - without it, the result is merely ignored.

5. **`set()`/`update()` is a local override (status `'local'`)**

- Great for optimistic UI, but the local value will be **replaced** as soon as the loader runs again (params change / reload).

6. **SSR**: the loader also runs on the server when the component is rendered - a slow loader stretches prerender/SSR time (this page's demo guards with `isPlatformBrowser` so the server returns immediately).
