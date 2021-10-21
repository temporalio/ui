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

  export let user: { name?: string; email?: string; picture?: string } = {};
</script>

<div
  id="header"
  class="h-16 w-full px-6 flex flex-row items-center justify-between static border-b-2"
>
  <NamespaceDropdown />
  <div class="flex flex-row justify-center items-center">
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
</style>
