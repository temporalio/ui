<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import PillContainer from './pill-container.svelte';
  import Pill from './pill.svelte';

  const { Story } = defineMeta({
    title: 'Pill Container',
    component: PillContainer,
  });
</script>

<Story name="Default" asChild>
  <PillContainer>
    <Pill id="A">Pill A</Pill>
    <Pill id="B">Pill B</Pill>
    <Pill id="C">Pill C</Pill>
  </PillContainer>
</Story>
