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

<Story name="Page Not Found" />

<Story
  name="Resource Not Found"
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
  name="Resource Not Found Without Namespace"
  args={{
    error: { statusCode: 404, message: 'Page Not Found' },
    resource: 'Nexus Endpoint',
    namespaced: false,
    back: { href: '#', label: 'Back to Nexus Endpoints' },
  }}
/>

<Story
  name="Bad Request"
  args={{
    error: { statusCode: 400, message: 'Invalid RunId.' },
    back,
  }}
/>

<Story
  name="Something Went Wrong"
  args={{
    error: { statusCode: 500, message: 'Internal Error' },
    back,
  }}
/>
