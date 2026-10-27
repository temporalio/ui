<script lang="ts">
  import SdkLogo from '$lib/components/lines-and-dots/sdk-logo.svelte';
  import Link from '$lib/holocene/link.svelte';

  interface Props {
    links: { sdk: string; href: string; version?: string }[];
  }

  let { links }: Props = $props();
</script>

<ul class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
  {#each links as { sdk, href, version = '' } (sdk)}
    <li>
      <Link newTab {href} class="flex min-h-11 items-center whitespace-nowrap">
        <SdkLogo {sdk} {version} hideDocsLink />
      </Link>
    </li>
  {/each}
</ul>
