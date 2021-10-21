<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  import NamespaceSelect from '$lib/components/namespace-select.svelte';
  import OutsideOfDropdown from '$lib/components/outside-of-dropdown.svelte';

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
  import { scale } from 'svelte/transition';
  import Icon from 'svelte-hero-icons/Icon.svelte';
  import { User } from 'svelte-hero-icons';

  export let user: { name?: string; email?: string; picture?: string } = {};
  export let showDropdown = false;
</script>

<div
  id="header"
  class="h-16 w-full px-6 flex flex-row items-center justify-between static border-b-2"
>
  <NamespaceSelect />
  <OutsideOfDropdown bind:showDropdown>
    <button
      on:click={() => (showDropdown = !showDropdown)}
      class="menu focus:outline-none focus:shadow-solid w-8 h-8"
    >
      {#if user?.picture}
        <img src={user.picture} alt={user.name} class="rounded-full" />
      {:else}
        <Icon src={User} class="rounded-full" />
      {/if}
    </button>

    {#if showDropdown}
      <div
        in:scale={{ duration: 100, start: 0.95 }}
        out:scale={{ duration: 75, start: 0.95 }}
        class="z-40 origin-top-right absolute top-14 right-8 w-40 py-2 mt-1 border-2
      rounded-md shadow-md bg-white"
      >
        <a
          href="https://github.com/temporalio/web/issues/new/choose"
          class="block px-4 py-2 hover:bg-green-500 hover:text-green-100"
        >
          Report Bug/Give Feedback
        </a>
        {#if user.email}
          <span
            href="/settings"
            class="block px-4 py-2 hover:bg-green-500 hover:text-green-100"
          >
            {user.email}
          </span>
        {:else}
          <a
            href={import.meta.env.VITE_API + '/auth/sso'}
            class="block px-4 py-2 hover:bg-green-500 hover:text-green-100"
          >
            Sign In
          </a>
        {/if}
        <a
          href="/settings"
          class="block px-4 py-2 hover:bg-green-500 hover:text-green-100"
          >Settings</a
        >
        {#if user.email}
          <a
            href={import.meta.env.VITE_API + '/auth/signout'}
            class="block px-4 py-2 hover:bg-green-500 hover:text-green-100"
          >
            Sign Out
          </a>
        {/if}
      </div>
    {/if}
  </OutsideOfDropdown>
</div>
