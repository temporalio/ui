<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import SuperFormsExample from './superforms-example.svelte';

  export const meta = {
    title: 'Forms/SuperForms',
    component: SuperFormsExample,
  } satisfies Meta<SuperFormsExample>;
</script>

<script lang="ts">
  import { Story } from '@storybook/addon-svelte-csf';
</script>

<Story name="SuperForms Examples">
  <SuperFormsExample />
</Story>
