<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
  } from '@storybook/addon-svelte-csf';

  import ProgressBar from '$lib/holocene/progress-bar.svelte';

  const { Story } = defineMeta({
    title: 'Progress Bar',
    component: ProgressBar,
    args: {
      width: '50%',
    },
  });
</script>

<script lang="ts">
  setTemplate(template);
</script>

{#snippet template(args: Args<typeof Story>)}
  <div class="relative mx-auto p-8">
    <ProgressBar {...args} />
  </div>
{/snippet}

<Story name="Partial" args={{ width: '60%' }} />
<Story name="Full" args={{ width: '100%' }} />
<Story name="Empty" args={{ width: '0%' }} />
