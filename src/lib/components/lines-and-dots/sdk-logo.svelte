<script lang="ts">
  import dotNet from '$lib/vendor/sdk-logos/dot-net-logo.png';
  import go from '$lib/vendor/sdk-logos/go-logo.png';
  import java from '$lib/vendor/sdk-logos/java-logo.png';
  import php from '$lib/vendor/sdk-logos/php-logo.png';
  import python from '$lib/vendor/sdk-logos/python-logo.png';
  import ruby from '$lib/vendor/sdk-logos/ruby-logo.png';
  import rust from '$lib/vendor/sdk-logos/rust-logo.png';
  import typescript from '$lib/vendor/sdk-logos/ts-logo.png';

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

  interface Props {
    sdk: string;
    version: string;
  }

  let { sdk, version }: Props = $props();
  const logo = $derived(sdkLogos[sdk.toLowerCase()]);
</script>

<p class="flex w-full items-center gap-1">
  {#if logo}
    <span class="relative flex w-6 shrink-0 items-center" aria-hidden="true">
      <img src={logo} alt="SDK Icon" class="absolute h-6 w-6" />
    </span>
  {/if}
  <span class="truncate">
    {sdk}
    {version}
  </span>
</p>
