<script>import { closedBanners, close } from '../../stores/banner';
export let key;
export let severity;
export let message;
export let link;
export let shownBanner;
$: show = !($closedBanners !== null && $closedBanners !== void 0 ? $closedBanners : []).includes(key);
$: {
    if (!show) {
        shownBanner++;
    }
}
</script>

{#if show}
  <section
    class={`relative block text-center leading-10 ${severity}`}
    data-cy={$$props.dataCy}
  >
    <a href={link} target="_blank">
      {message}
    </a>
    <button
      on:click={() => close(key)}
      class="text-black-600 absolute top-0 right-0 mr-5"
      data-cy="close-banner"
    >
      ✕
    </button>
  </section>
{/if}

<style>
  .high {

    --tw-bg-opacity: 1;

    background-color: rgb(254 202 202 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(127 29 29 / var(--tw-text-opacity))
}

  .medium {

    --tw-bg-opacity: 1;

    background-color: rgb(254 215 170 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(124 45 18 / var(--tw-text-opacity))
}

  .low {

    --tw-bg-opacity: 1;

    background-color: rgb(219 234 254 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(30 58 138 / var(--tw-text-opacity))
}</style>
