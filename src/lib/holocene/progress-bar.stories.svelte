<script lang="ts" context="module">
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import type { Meta } from '@storybook/svelte';

  import ProgressBar from '$lib/holocene/progress-bar.svelte';

  export const meta = {
    title: 'Progress Bar',
    component: ProgressBar,
  } as Meta<ProgressBar>;
</script>

<Template>
  <div class="relative mx-auto p-8">
    <ProgressBar />
  </div>
</Template>

<Story name="Full" />
