<script lang="ts">
  import DropdownButton from '$lib/holocene/dropdown-button/dropdown-button.svelte';
  import Item from '$lib/holocene/dropdown-button/radio-menu-item.svelte';
  import Chapter from '../_chapter.svelte';

  let value: string;

  const updateValue = (event: CustomEvent<{ value: string }>) => {
    value = event.detail.value;
  };
</script>

<Chapter description="A simple dropdown menu">
  <DropdownButton
    label={value ? `${value} day retention` : 'Retention Policy'}
    icon="stopwatch"
  >
    {#each ['3', '7', '15', '30', '60', '90'] as v}
      <Item
        on:click={updateValue}
        name="pizza-toppings"
        value={v}
        checked={value === v}>{v} Days</Item
      >
    {/each}
  </DropdownButton>
</Chapter>

<Chapter description="A readonly dropdown menu">
  <DropdownButton readonly label="region-1" icon="globe" />
</Chapter>
