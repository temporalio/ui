<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  import NamespaceDropdown from '$lib/components/namespace-dropdown.svelte';

  export async function load({ fetch }: LoadInput) {
    const user = await fetch(import.meta.env.VITE_API + '/api/v1/me/').then(
      (response) => response.json(),
    );

    return {
      props: { user },
    };
  }
</script>

<script lang="ts">
  import { namespace } from '$lib/stores/namespace';
  const html = document.querySelector('html');
  $: isDarkMode = html.classList.contains('dark');

  const setIsDarkMode = () => {
    isDarkMode = !isDarkMode;
    isDarkMode ? html.classList.add('dark') : html.classList.remove('dark');
  };

  export let user: { name?: string; email?: string; picture?: string } = {};
</script>

<div
  id="header"
  class="h-16 w-full px-6 flex flex-row items-center justify-between static border-b-2"
>
  <NamespaceDropdown />
  <div class="flex flex-row justify-center items-center">
    <div class="flex justify-end items-center space-x-2 mx-auto relative">
      <span class="text-xs font-extralight">☀️</span>
      <div>
        <input
          type="checkbox"
          id="checkbox"
          class="hidden"
          bind:checked={isDarkMode}
          on:click={setIsDarkMode}
        />
        <label for="checkbox" class="cursor-pointer">
          <div class="w-9 h-5 flex items-center bg-gray-300 rounded-full p2">
            <div class="w-4 h-4 bg-white rounded-full shadow switch-ball" />
          </div>
        </label>
      </div>
      <span class="text-xs font-semibold">🌕</span>
    </div>
    <a href="https://github.com/temporalio/web/issues/new/choose">
      Report Bug/Give Feedback
    </a>
    {#if user.email}
      <span href={`/namespaces/${$namespace}/settings`}>
        {user.email}
      </span>
    {:else}
      <a href={import.meta.env.VITE_API + '/auth/sso'}> Sign In </a>
    {/if}
  </div>
</div>

<style lang="postcss">
  a {
    @apply block px-4 py-2 text-sm;
  }
  a:hover {
    @apply bg-purple-100 rounded-md;
  }

  #checkbox:checked + label .switch-ball {
    background-color: gold;
    transform: translateX(20px);
    transition: transform 0.2s linear;
  }
</style>
