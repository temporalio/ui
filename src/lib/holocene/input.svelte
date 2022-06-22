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
  export let theme: 'dark' | 'light' = 'light';

  let copied = false;
  const handleCopy = () =>
    navigator.clipboard
      .writeText(value)
      .then(() => {
        copied = !copied;
        setTimeout(() => (copied = false), 100);
      })
      .catch((error) => console.error(error));
</script>

<div class="input-container {theme}" class:copyable>
  <label for={id} class="hidden">{label}</label>
  {#if icon !== ''}
    <span class="icon-container">
      <Icon name={icon} scale={0.9} stroke="currentcolor" />
    </span>
  {/if}
  <input
    class="block w-full focus:outline-none bg-white m-2"
    class:copyable
    disabled={copyable}
    {placeholder}
    {id}
    {name}
    bind:value
    on:input
    on:change
  />
  {#if copyable}
    <div class="copy-icon-container" on:click={handleCopy}>
      <Icon name={copied ? 'checkMark' : 'copy'} stroke="currentcolor" />
    </div>
  {/if}
</div>

<style lang="postcss">
  /* Base styles */
  .input-container {
    @apply relative box-border inline-flex h-10 w-full items-center rounded-lg border text-base focus-within:border-blue-700;
  }

  .input-container.copyable {
    @apply border;
  }

  .icon-container {
    @apply flex items-center justify-center ml-2;
  }

  .copy-icon-container {
    @apply flex items-center justify-center h-full w-9 cursor-pointer border-l rounded-r-lg;
  }

  /* Light theme styles */
  .input-container.light,
  .input-container.light .icon-container,
  .input-container.light input {
    @apply bg-white;
  }

  .input-container.light .icon-container {
    @apply text-gray-400;
  }

  .input-container.light.copyable,
  .input-container.light.copyable input,
  .input-container.light.copyable .copy-icon-container {
    @apply bg-gray-50 border-gray-900 text-gray-900;
  }

  /* Dark theme styles */
  .input-container.dark,
  .input-container.dark .icon-container,
  .input-container.dark input,
  .input-container.dark .copy-icon-container {
    @apply bg-gray-900 text-white;
  }

  .input-container.dark input {
    @apply placeholder:text-gray-400;
  }

  .input-container.dark.copyable,
  .input-container.dark.copyable .copy-icon-container,
  .input-container.dark.copyable input {
    @apply bg-gray-900 border-gray-900;
  }
</style>
