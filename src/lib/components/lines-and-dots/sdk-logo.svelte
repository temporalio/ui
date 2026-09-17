<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import {
    IconBook,
    type IconComponent,
    IconDotnetColorblock,
    IconGoColorblock,
    IconJavaColorblock,
    IconPhpColorblock,
    IconPythonColorblock,
    IconRubyColorblock,
    IconRustColorblock,
    IconTypescriptColorblock,
  } from '$lib/io/icon';

  const sdkLogos: Record<string, IconComponent> = {
    go: IconGoColorblock,
    typescript: IconTypescriptColorblock,
    java: IconJavaColorblock,
    python: IconPythonColorblock,
    '.net': IconDotnetColorblock,
    ruby: IconRubyColorblock,
    php: IconPhpColorblock,
    rust: IconRustColorblock,
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
    hideDocsLink?: boolean;
  }

  let { sdk, version, hideDocsLink = false }: Props = $props();
  const Logo = $derived(sdkLogos[sdk.toLowerCase()]);
  const href = $derived(
    sdkToDocsSlug[sdk]
      ? `https://docs.temporal.io/develop/${sdkToDocsSlug[sdk]}`
      : undefined,
  );
</script>

<p class="flex w-full items-center gap-2">
  {#if Logo}
    <span class="relative flex w-6 shrink-0 items-center" aria-hidden="true">
      <Logo class="absolute h-6 w-6" />
    </span>
  {/if}
  <Tooltip bottomRight text={`${sdk} ${version}`}>
    <span class="truncate">
      {sdk}
      {version}
    </span>
  </Tooltip>
  {#if href && !hideDocsLink}
    <Link TrailingIcon={IconBook} {href} newTab>Docs</Link>
  {/if}
</p>
