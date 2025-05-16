<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import PillContainer from './pill-container.svelte';
  import Pill from './pill.svelte';

  export const meta = {
    title: 'Pill Container',
    component: PillContainer,
    subcomponents: { Pill },
  } satisfies Meta<typeof PillContainer>;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template>
  <PillContainer>
    <Pill id="A" active={true}>Pill A</Pill>
    <Pill id="B" disabled={true}>Pill B</Pill>
    <Pill id="C" disabled={true}>Pill C</Pill>
  </PillContainer>
</Template>

<Story name="Default" />
