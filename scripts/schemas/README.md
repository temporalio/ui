# $lib/schemas

These scripts generate Zod schemas for Temporal API types, based on the OpenAPI definitions from the Temporal API repository.

## Overview

The schemas package provides strongly-typed validation and parsing for API
requests and responses when working with the Temporal API. It leverages Zod to
create runtime type validation that matches the OpenAPI specifications.

## Getting Started

### Generating Schemas

To generate or update the schemas, from the root of the UI project:

```bash
pnpm generate:schemas
```

This will:

1. Fetch the latest Temporal API definitions
2. Generate TypeScript type definitions from the OpenAPI schema
3. Create Zod schemas for each component in the API
4. Update the package exports

### Error Handling

The schema generation scripts use a standardized error handling approach for Bun system calls through the `handleBunError` utility in `lib/error-handler.ts`. This provides clear, actionable error messages when something goes wrong, including:

- User-friendly error messages with actionable advice
- Detection of common issues (missing modules, permissions, etc.)
- Clear indications of what command failed
- Suggestions for resolution

### Using Schemas

Import the schemas you need:

```typescript
import { WorkflowExecutionInfoSchema } from '$lib/schemas';
```

#### Validating Request Payloads

When sending data to the Temporal API, validate it first:

```typescript
import { SignalWorkflowExecutionRequestSchema } from '$lib/schemas';

// Validate request data
const requestData = {
  namespace: 'default',
  workflowId: 'my-workflow',
  signalName: 'my-signal',
  input: { data: 'some value' },
};

// Parse and validate the request data
const validatedRequest =
  SignalWorkflowExecutionRequestSchema.parse(requestData);

// Now you can safely send the validated data to the API
await fetch('/api/workflows/signal', {
  method: 'POST',
  body: JSON.stringify(validatedRequest),
});
```

#### Validating Response Data

When receiving data from the Temporal API, validate it:

```typescript
import { WorkflowExecutionInfoSchema } from '$lib/schemas';

// Fetch workflow data
const response = await fetch('/api/workflows/get?workflowId=my-workflow');
const data = await response.json();

// Parse and validate the response
try {
  const workflow = WorkflowExecutionInfoSchema.parse(data);
  // Now you can safely use the validated workflow data
  console.log(workflow.type.name);
} catch (err) {
  // Handle validation errors
  console.error('Invalid workflow data received', err);
}
```

#### Partial Validation

You can also validate partial data structures:

```typescript
import { WorkflowExecutionInfoSchema } from '$lib/schemas';

// Create a partial schema for just the fields you need
const PartialWorkflowSchema = WorkflowExecutionInfoSchema.pick({
  workflowId: true,
  status: true,
});

// Validate just those fields
const partialData = PartialWorkflowSchema.parse(someData);
```

## Schema Structure

Each generated schema corresponds to a component in the Temporal API OpenAPI
definition. The schemas match the structure of the API and provide type-safe
validation through Zod.

## Development

When making changes to the Temporal API, the schemas should be regenerated to
ensure they match the latest API definitions.
