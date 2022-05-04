<script lang="ts">
  import Icon from 'svelte-fa';
  import { faSpinner } from '@fortawesome/free-solid-svg-icons';
  import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

  export let disabled: boolean = false;
  export let loading: boolean = false;
  export let active: boolean = false;
  export let icon: IconDefinition = null;
  export let classes: string = $$props.class;
  export let color: Color = 'blue';
</script>

<button on:click class={`pill ${classes}`} class:active {disabled}>
  {#if icon}
    <span class:animate-spin={loading}>
      <Icon icon={loading ? faSpinner : icon} scale={1} />
    </span>
  {/if}
  <slot />
</button>

<style lang="postcss">
  .pill {
    @apply flex items-center gap-1 justify-center rounded-full px-3 py-1 text-sm border-2 border-gray-100 text-gray-500;
  }

  .active {
    @apply bg-white text-gray-900 border-2 border-gray-900;
  }

  .gray {
    @apply bg-gray-100 text-gray-700;
  }
  .gray.active {
    @apply border-2 border-b-0 border-gray-700;
  }

  .blueGray {
    @apply bg-blueGray-200 text-blueGray-900;
  }
  .blueGray.active {
    @apply border-2 border-b-0 border-blueGray-900;
  }

  .blue {
    @apply bg-blue-100 text-blue-700;
  }
  .blue.active {
    @apply border-2 border-b-0 border-blue-700;
  }

  .green {
    @apply bg-green-100 text-green-700;
  }
  .green.active {
    @apply border-2 border-b-0 border-green-700;
  }

  .yellow {
    @apply bg-yellow-100 text-yellow-900;
  }
  .yellow.active {
    @apply border-2 border-b-0 border-yellow-900;
  }

  .orange {
    @apply bg-orange-100 text-orange-900;
  }
  .orange.active {
    @apply border-2 border-b-0 border-orange-900;
  }

  .red {
    @apply bg-red-100 text-red-700;
  }
  .red.active {
    @apply border-2 border-b-0 border-red-700;
  }

  .indigo {
    @apply bg-indigo-100 text-indigo-700;
  }
  .indigo.active {
    @apply border-2 border-b-0 border-indigo-700;
  }

  .purple {
    @apply bg-purple-100 text-purple-700;
  }
  .purple.active {
    @apply border-2 border-b-0 border-purple-700;
  }

  .pink {
    @apply bg-pink-100 text-pink-700;
  }
  .pink.active {
    @apply border-2 border-b-0 border-pink-700;
  }
</style>
