# Temporal HTTP Client

**Nota bene**: This is currently experimental.

Provides a typesafe API client for [Temporal](https://temporal.io)'s HTTP API. This is primarily intended for use in [Temporal's UI](https://github.com/temporalio/ui).

## Updating the Schema

`bun generate`

This will download [Temporal's API repository](https://github.com/temporalio/api), generate types based on the OpenAPI specification, and write the types to `src/schema.d.ts`.

It will also create a set of client methods in `src/client.ts`.

## Usage

```ts
import TemporalClient from 'temporal-http-client';

const client = new TemporalClient('http://localhost:8233');

const response = await client.getClusterInfo();

console.log(response);
```

Failing requests will trigger a `TemporalError`, which includes the `Request` and `Response` objects.

The library also exports the following:

- `TemporalError`
- `isTemporalError`
