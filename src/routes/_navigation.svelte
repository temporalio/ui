<script lang="ts">
  import { Home, Photograph } from 'svelte-hero-icons';
  import NavigationLink from './_navigation-link.svelte';
</script>

<nav
  id="sidebar"
  class="w-28 h-screen py-6 flex flex-col items-center bg-black"
>
  <img src="/logo.svg" alt="Temporal Logo" class="rounded-full w-12" />
  <div class="m-6 text-white text-center">
    <h3 class="text-sm font-bold">Namespace</h3>
    <p class="text-sm">default</p>
  </div>
  <NavigationLink href="/" label="Home" icon={Home} />
  <NavigationLink href="/workflows" label="Workflows" icon={Photograph} />
</nav>
