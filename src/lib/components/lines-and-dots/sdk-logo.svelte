<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import dotNet from '$lib/vendor/sdk-logos/dotnet-colorblock.svg';
  import go from '$lib/vendor/sdk-logos/go-colorblock.svg';
  import java from '$lib/vendor/sdk-logos/java-colorblock.svg';
  import php from '$lib/vendor/sdk-logos/php-colorblock.svg';
  import python from '$lib/vendor/sdk-logos/python-colorblock.svg';
  import ruby from '$lib/vendor/sdk-logos/ruby-colorblock.svg';
  import rust from '$lib/vendor/sdk-logos/rust-colorblock.svg';
  import typescript from '$lib/vendor/sdk-logos/typescript-colorblock.svg';

  const sdkLogos: Record<string, string> = {
    go,
    typescript,
    java,
    python,
    '.net': dotNet,
    ruby,
    php,
    rust,
  };

  const sdkToDocsSlug: Record<string, string> = {
    Ruby: 'ruby',
    Go: 'go',
    Java: 'java',
    Python: 'python',
    '.NET': 'dotnet',
    PHP: 'php',
    Typescript: 'typescript',
  };

  interface Props {
    sdk: string;
    version: string;
  }

  let { sdk, version }: Props = $props();
  const logo = $derived(sdkLogos[sdk.toLowerCase()]);
  const href = $derived(
    sdkToDocsSlug[sdk]
      ? `https://docs.temporal.io/develop/${sdkToDocsSlug[sdk]}`
      : undefined,
  );
</script>

<p class="flex w-full items-center gap-2">
  {#if logo}
    <span class="relative flex w-6 shrink-0 items-center" aria-hidden="true">
      <img src={logo} alt="SDK Icon" class="absolute h-6 w-6" />
    </span>
  {/if}
  <span class="truncate">
    {sdk}
    {version}
  </span>
  {#if href}
    <Link {href} newTab>Docs</Link>
    <Icon name="book" />
  {/if}
</p>
