<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import Loading from './loading.svelte';

  export const meta = {
    title: 'Loading',
    component: Loading,
    args: {},
    argTypes: {},
  } satisfies Meta<Loading>;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
  <Loading {...args} />
</Template>

<Story name="Default" />

<Story name="Change size of loader">
  <Loading class="w-fit scale-[.70]"></Loading>
</Story>
