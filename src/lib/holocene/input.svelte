<script lang="ts">
  import Icon from '$lib/holocene/icon/index.svelte';
  import type { IconName } from '$lib/holocene/icon/paths';

  export let id: string;
  export let label: string;
  export let value: string;
  export let icon: IconName = '';
  export let placeholder = label;
  export let name = id;
  export let copyable: boolean = false;

  function handleCopy() {}
</script>

<div class="input-container focus-within:border-blue-700">
  <label for={id} class="hidden">{label}</label>
  {#if icon !== ''}
    <span class="icon-container">
      <Icon name={icon} scale={0.9} stroke="gray" class="flex items-center" />
    </span>
  {/if}
  <input
    class="block w-full focus:outline-none bg-white"
    {placeholder}
    {id}
    {name}
    bind:value
    on:input
    on:change
  />
  {#if copyable}
    <span class="icon-container cursor-pointer" on:click={handleCopy}>
      <Icon name="copy" stroke="gray" />
    </span>
  {/if}
</div>

<style lang="postcss">
  .input-container {
    @apply relative box-border inline-flex h-10 w-full items-center rounded-lg border-2 p-2 text-base bg-white;
  }

  span {
    @apply mr-1;
  }
</style>
