<script lang="ts">
  import { sdkLogos } from '$lib/components/lines-and-dots/sdk-logo.svelte';
  import { ButtonLink } from '$lib/io/button';

  interface Props {
    links: { sdk: string; href: string; version?: string }[];
    label?: string;
  }

  let { links, label }: Props = $props();
</script>

<div class="flex w-full flex-col items-center gap-3">
  {#if label}
    <p class="text-sm font-bold uppercase tracking-wide text-tertiary">
      {label}
    </p>
  {/if}
  <div class="flex flex-wrap items-center justify-center gap-2 lg:flex-nowrap">
    {#each links as { sdk, href, version } (sdk)}
      <ButtonLink
        {href}
        colorScheme="tertiary"
        LeadingIcon={sdkLogos[sdk.toLowerCase()]}
        target="_blank"
        rel="noreferrer noopener"
      >
        {version ? `${sdk} ${version}` : sdk}
      </ButtonLink>
    {/each}
  </div>
</div>
