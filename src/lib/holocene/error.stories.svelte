<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import Error from './error.svelte';

  const back = { href: '#', label: 'Back to Workflows' };

  const { Story } = defineMeta({
    title: 'Error',
    component: Error,
    args: {
      error: { statusCode: 404, message: 'Not Found' },
    },
  });
</script>

<Story name="404 Page Not Found" exportName="PageNotFound" />

<Story
  name="404 Resource Not Found"
  exportName="ResourceNotFound"
  args={{
    error: {
      statusCode: 404,
      message: 'workflow execution not found for workflow ID "missing-wf"',
    },
    resource: 'Workflow',
    back,
  }}
/>

<Story
  name="404 Resource Not Found Without Namespace"
  exportName="ResourceNotFoundWithoutNamespace"
  args={{
    error: { statusCode: 404, message: 'Page Not Found' },
    resource: 'Nexus Endpoint',
    namespaced: false,
    back: { href: '#', label: 'Back to Nexus Endpoints' },
  }}
/>

<Story
  name="400 Bad Request"
  exportName="BadRequest"
  args={{
    error: { statusCode: 400, message: 'Invalid RunId.' },
    back,
  }}
/>

<Story
  name="429 Rate Limited"
  args={{
    error: { statusCode: 429, message: 'namespace rate limit exceeded' },
    back,
  }}
/>

<Story
  name="500 Something Went Wrong"
  exportName="SomethingWentWrong"
  args={{
    error: { statusCode: 500, message: 'Internal Error' },
    back,
  }}
/>
