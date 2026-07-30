<svelte:options runes />

<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import ProgressBar from '$lib/holocene/progress-bar.svelte';

  const { Story } = defineMeta({
    title: 'Progress Bar',
    component: ProgressBar,
  });
</script>

<Story name="Full" asChild>
  <div class="relative mx-auto p-8">
    <ProgressBar />
  </div>
</Story>
