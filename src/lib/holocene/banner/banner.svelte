<script lang="ts">
  import IconButton from '$lib/holocene/icon-button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { bannerClosed } from '$lib/stores/banner';

  export let message: string;

  $: show = message && !$bannerClosed;
</script>

{#if show}
  <section class="banner" {...$$restProps}>
    {message}
    <IconButton
      on:click={() => ($bannerClosed = true)}
      data-testid="close-banner"
      class="text-black-600 absolute top-0 right-0 mr-5 h-10 w-10"
      icon="close"
      label={translate('common.close')}
    />
  </section>
{/if}

<style lang="postcss">
  .banner {
    @apply relative block flex items-center justify-center bg-indigo-200 text-center leading-10 text-indigo-900;
  }
</style>
