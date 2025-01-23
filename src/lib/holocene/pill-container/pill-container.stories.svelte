<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
  } from '@storybook/addon-svelte-csf';

  import PillContainer from './pill-container.svelte';
  import Pill from './pill.svelte';

  const { Story } = defineMeta({
    title: 'Pill Container',
    component: PillContainer,
    subcomponents: { Pill },
  });
</script>

<script lang="ts">
  setTemplate(template);
</script>

{#snippet template(args: Args<typeof Story>)}
  <PillContainer {...args}>
    <Pill id="A">Pill A</Pill>
    <Pill id="B">Pill B</Pill>
    <Pill id="C">Pill C</Pill>
  </PillContainer>
{/snippet}

<Story name="Default" />
