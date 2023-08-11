<script lang="ts">
  import { closedBanners, close } from '$lib/stores/banner';
  import { translate } from '$lib/i18n/translate';
  import IconButton from '$lib/holocene/icon-button.svelte';
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
    {...$$restProps}
  >
    <a href={link} target="_blank" rel="noreferrer">
      {message}
    </a>

    <IconButton
      on:click={() => close(key)}
      data-testid="close-banner"
      class="text-black-600 absolute top-0 right-0 h-10 w-10 mr-5"
      icon="close"
      label={translate('close')}
    />
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
