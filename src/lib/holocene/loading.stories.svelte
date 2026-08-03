<svelte:options runes />

<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import Loading from './loading.svelte';

  const { Story } = defineMeta({
    title: 'Loading',
    component: Loading,
    args: {},
    argTypes: {},
  });
</script>

<Story name="Default" />

<Story name="Change size of loader" asChild>
  <Loading class="w-fit scale-[.70]"></Loading>
</Story>
