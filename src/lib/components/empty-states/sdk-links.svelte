<script lang="ts">
  import { twJoin } from 'tailwind-merge';

  import { sdkLogos } from '$lib/components/lines-and-dots/sdk-logo.svelte';

  interface Props {
    links: { sdk: string; href: string; version?: string }[];
    label?: string;
  }

  let { links, label }: Props = $props();

  const pillClass = twJoin(
    'inline-flex min-h-9 items-center gap-2 rounded-full border border-secondary',
    'bg-surface-primary px-3 py-1.5 text-sm font-medium text-primary',
    'whitespace-nowrap no-underline transition-colors',
    'hover:border-tertiary hover:bg-interactive-tertiary-hover',
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-interactive-primary focus-visible:ring-offset-2',
    'focus-visible:ring-offset-background-primary',
  );
</script>

<div class="flex w-full flex-col items-center gap-3">
  {#if label}
    <p class="text-xs font-medium uppercase tracking-wide text-tertiary">
      {label}
    </p>
  {/if}
  <ul class="flex flex-wrap items-center justify-center gap-2 lg:flex-nowrap">
    {#each links as { sdk, href, version } (sdk)}
      {@const Logo = sdkLogos[sdk.toLowerCase()]}
      <li>
        <a {href} target="_blank" rel="noreferrer noopener" class={pillClass}>
          {#if Logo}
            <span class="flex shrink-0" aria-hidden="true">
              <Logo class="size-5" />
            </span>
          {/if}
          <span>{version ? `${sdk} ${version}` : sdk}</span>
        </a>
      </li>
    {/each}
  </ul>
</div>
