<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import Loading from './loading.svelte';

  export const meta = {
    title: 'Loading',
    component: Loading,
    args: {
      title: 'Loading...',
    },
    argTypes: {
      title: { control: 'text' },
    },
  } satisfies Meta<Loading>;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
  <Loading {...args} />
</Template>

<Story name="Default" />
