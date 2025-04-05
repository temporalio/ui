<script lang="ts" context="module">
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import type { Meta } from '@storybook/svelte';

  import ProgressBar from '$lib/holocene/progress-bar.svelte';

  export const meta = {
    title: 'Progress Bar',
    component: ProgressBar,
    args: {
      width: '50%',
    },
  } as Meta<ProgressBar>;
</script>

<Template let:args>
  <div class="relative mx-auto p-8">
    <ProgressBar {...args} />
  </div>
</Template>

<Story name="Partial" args={{ width: '60%' }} />
<Story name="Full" args={{ width: '100%' }} />
<Story name="Empty" args={{ width: '0%' }} />
