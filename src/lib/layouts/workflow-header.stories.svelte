<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  export const meta = {
    title: 'Layouts/WorkflowHeader',
    parameters: {
      docs: {
        page: null,
      },
    },
  } satisfies Meta;
</script>

<script lang="ts">
  import { Story } from '@storybook/addon-svelte-csf';
</script>

<Story name="Documentation">
  <div class="p-4">
    <p class="text-gray-600">
      See the Docs page for complete WorkflowHeader usage documentation.
    </p>
  </div>
</Story>
