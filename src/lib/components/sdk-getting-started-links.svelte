<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import IconDotnetColorblock from '$lib/io/icon/icons/dotnet-colorblock.svelte';
  import IconGoColorblock from '$lib/io/icon/icons/go-colorblock.svelte';
  import IconJavaColorblock from '$lib/io/icon/icons/java-colorblock.svelte';
  import IconPythonColorblock from '$lib/io/icon/icons/python-colorblock.svelte';
  import IconRubyColorblock from '$lib/io/icon/icons/ruby-colorblock.svelte';
  import IconRustColorblock from '$lib/io/icon/icons/rust-colorblock.svelte';
  import IconSwiftColorblock from '$lib/io/icon/icons/swift-colorblock.svelte';
  import IconTypescriptColorblock from '$lib/io/icon/icons/typescript-colorblock.svelte';
  import type { IconComponent } from '$lib/io/icon/types';

  const SDKS: {
    id: string;
    name: string;
    Icon: IconComponent;
    href?: string;
  }[] = [
    {
      id: 'go',
      name: 'Go',
      Icon: IconGoColorblock,
      href: 'https://learn.temporal.io/getting_started/go/',
    },
    {
      id: 'python',
      name: 'Python',
      Icon: IconPythonColorblock,
      href: 'https://learn.temporal.io/getting_started/python/',
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      Icon: IconTypescriptColorblock,
      href: 'https://learn.temporal.io/getting_started/typescript/',
    },
    {
      id: 'dotnet',
      name: '.NET',
      Icon: IconDotnetColorblock,
      href: 'https://learn.temporal.io/getting_started/dotnet/',
    },
    {
      id: 'ruby',
      name: 'Ruby',
      Icon: IconRubyColorblock,
      href: 'https://learn.temporal.io/getting_started/ruby/',
    },
    {
      id: 'java',
      name: 'Java',
      Icon: IconJavaColorblock,
      href: 'https://learn.temporal.io/getting_started/java/',
    },
    {
      id: 'rust',
      name: 'Rust',
      Icon: IconRustColorblock,
      href: 'https://docs.temporal.io/develop/rust/quickstart',
    },
    { id: 'swift', name: 'Swift', Icon: IconSwiftColorblock },
  ];
</script>

<div class="flex flex-wrap justify-center gap-2">
  {#each SDKS as { id, name, Icon, href } (id)}
    {#if href}
      <Link newTab {href} aria-label={name} data-testid="sdk-icon-{id}">
        <Icon title={name} />
      </Link>
    {:else}
      <span data-testid="sdk-icon-{id}">
        <Icon title={name} />
      </span>
    {/if}
  {/each}
</div>
