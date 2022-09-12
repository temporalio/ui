<script lang="ts">
  import { writable } from 'svelte/store';
  import { onDestroy, setContext } from 'svelte';
  import type { IconName } from '$lib/holocene/icon/paths';

  import type { SelectContext } from '$lib/holocene/select/select.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Menu from '$holocene/primitives/menu/menu.svelte';
  import MenuContainer from '$holocene/primitives/menu/menu-container.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import { noop } from 'svelte/internal';

  export let id: string;
  export let options: { label: string; value: string }[] = [];
  export let placeholder = '';
  export let icon: IconName = null;

  export let onChange: (value: string) => void = noop;

  let value = '';
  let showMenu = false;

  $: {
    if (value) {
      options = options.filter((o) =>
        o.label.toLowerCase().includes(value.toLowerCase()),
      );
    } else {
      options = options;
    }
  }

  const context = writable<SelectContext<string>>({
    selectValue: value,
    onChange,
  });

  const unsubscribe = context.subscribe((ctx) => {
    value = ctx.selectValue;
  });

  onDestroy(() => {
    unsubscribe();
  });

  $: {
    if (value) {
      context.update((previous) => ({ ...previous, selectValue: value }));
    }

    setContext('select-value', context);
  }
</script>

<MenuContainer class={$$props.class}>
  <Input
    {id}
    {icon}
    class={$$props.class}
    bind:value
    {placeholder}
    on:focus={() => (showMenu = true)}
  />
  <Menu show={showMenu} id={`menu-${id}`}>
    {#each options as { label, value }}
      <Option {value}>{label}</Option>
    {:else}
      <Option>No Results</Option>
    {/each}
  </Menu>
</MenuContainer>
