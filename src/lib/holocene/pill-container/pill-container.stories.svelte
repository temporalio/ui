<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import PillContainer from './pill-container.svelte';
  import Pill from './pill.svelte';

  export const meta: Meta = {
    title: 'Pill Container',
    component: PillContainer,
    subcomponents: { Pill },
  };
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
  <PillContainer {...args}>
    <Pill id="A">Pill A</Pill>
    <Pill id="B" disabled={true}>Pill B</Pill>
    <Pill id="C" disabled={true}>Pill C</Pill>
  </PillContainer>
</Template>

<Story name="Default" />
