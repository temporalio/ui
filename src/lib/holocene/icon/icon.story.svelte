<script lang="ts">
  import Icon from './icon.svelte';
  import { type IconName, icons } from './paths';

  export let Hst;
  export let size = 24;

  const iconNames: IconName[] = Object.keys(icons) as IconName[];
</script>

<Hst.Story>
  {#each iconNames as icon}
    <Hst.Variant title={icon}>
      <Icon name={icon} height={size} width={size} />
    </Hst.Variant>
  {/each}

  <svelte:fragment slot="controls">
    <Hst.Number step={2} title="Icon Size:" bind:value={size} />
  </svelte:fragment>
</Hst.Story>
