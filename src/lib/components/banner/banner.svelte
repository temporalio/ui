<script lang="ts">
  import { closedBanners, close } from '$lib/stores/banner';
  import type { BannersState } from '$lib/models/banner-state';
  export let key: string;
  export let severity: 'high' | 'medium' | 'low';
  export let message: string;
  export let link: string;
  export let shownBanner: BannersState;

  $: show = !($closedBanners ?? []).includes(key);

  $: {
    if (!show) {
      shownBanner++;
    }
  }
</script>

{#if show}
  <section
    class={`relative block text-center leading-10 ${severity}`}
    data-testid={$$props.testId}
  >
    <a href={link} target="_blank" rel="noreferrer">
      {message}
    </a>
    <button
      on:click={() => close(key)}
      class="text-black-600 absolute top-0 right-0 mr-5"
      data-testid="close-banner"
    >
      ✕
    </button>
  </section>
{/if}

<style lang="postcss">
  .high {
    @apply bg-red-200 text-red-900;
  }

  .medium {
    @apply bg-orange-200 text-orange-900;
  }

  .low {
    @apply bg-blue-100 text-blue-900;
  }
</style>
