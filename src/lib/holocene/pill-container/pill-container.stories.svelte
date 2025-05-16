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
  import { Story } from '@storybook/addon-svelte-csf';
</script>

<PillContainer>
  <Pill id="A">Pill A</Pill>
  <Pill id="B" disabled={true}>Pill B</Pill>
  <Pill id="C" disabled={true}>Pill C</Pill>
</PillContainer>

<Story name="Default" />
