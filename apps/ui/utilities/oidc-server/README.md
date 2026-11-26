# OIDC Server

This is a standalone Express-based OpenID Connect (OIDC) server built with `oidc-provider`.

## Configuration

- Default port: `8889` (override with `PORT` environment variable)
- Issuer URL: `http://localhost:<PORT>` (override with `ISSUER` environment variable)

## Running the Server

Install dependencies (from project root if using monorepo):
```bash
npm install
```

Start the server:
```bash
PORT=8889 node index.js
```

Once running, visit `http://localhost:8889/.well-known/openid-configuration` to inspect the provider configuration.
Once running, visit `http://localhost:8889/.well-known/openid-configuration` to inspect the provider configuration.

## Views and Routes

Custom EJS views are located in the `views/` directory. Express routes for OIDC interactions are defined in `routes/express.js`.
  
## Testing

Verify the server boots and shuts down cleanly by running:
```bash
cd utilities/oidc-server
ts-node test-server.ts
```
