<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import colors from 'tailwindcss/colors';
  import Icon from '$holocene/icon/index.svelte';
  import Menu from '$holocene/primitives/menu/menu.svelte';
  import Option, { isOption } from '$holocene/select/option.svelte';
  import type { Option as OptionType } from '$holocene/select/option.svelte';
  import MenuButton from '$holocene/primitives/menu/menu-button.svelte';
  import MenuContainer from '$holocene/primitives/menu/menu-container.svelte';

  let show = false;

  export let label = '';
  export let id: string;
  export let placeholder: string;
  export let value = '';
  export let options: { label: string; value: string }[] = [];
</script>

{#if label}
  <label for={id} class={$$props.labelClass}>{label}</label>
{/if}
<select {value} {id} class={$$props.class} {placeholder} on:select>
  {#each options as option}
    <option value={option.value}>{label}</option>
  {/each}
</select>
