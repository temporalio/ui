<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ fetch, page }: LoadInput) {
    const user = await fetch(
      'http://localhost:8080/api/v1/me/',
    ).then((response) => response.json());

    return {
      props: { user },
    };
  }

  // import NavigationLink from './_navigation-link.svelte';
</script>

<script lang="ts">
  import { scale } from 'svelte/transition';
  import Icon, { User } from 'svelte-hero-icons';

  export let user: { name?: string; email?: string; picture?: string } = {};
  export let showMenu = false;

  // const signin = async () => {
  //   window.location.assign('http://localhost:8080/auth/sso');
  //   // await fetch('http://localhost:8080/auth/sso', {
  //   //   // redirect: 'manual',
  //   // })
  //   //   .then((resp) => {
  //   //     if (resp.redirected) {
  //   //       window.location.href = resp.url;
  //   //     }
  //   //   })
  //   //   .catch((error) => console.error(error));
  // };

  // const signout = () => {
  //   window.location.assign('/auth/logout');
  // };
</script>

<div
  id="header"
  class="h-16 w-full px-6 flex flex-row items-center justify-end static"
>
  <button
    on:click={() => (showMenu = !showMenu)}
    class="menu focus:outline-none focus:shadow-solid w-8 h-8"
  >
    {#if user?.picture}
      <img src={user.picture} alt={user.name} class="rounded-full" />
    {:else}
      <Icon src={User} class="rounded-full" />
    {/if}
  </button>

  {#if showMenu}
    <div
      in:scale={{ duration: 100, start: 0.95 }}
      out:scale={{ duration: 75, start: 0.95 }}
      class="origin-top-right absolute top-14 right-8 w-40 py-2 mt-1 border-2
      rounded-md shadow-md bg-white"
    >
      {#if user.email}
        <span
          href="/settings"
          class="block px-4 py-2 hover:bg-green-500 hover:text-green-100"
          >{user.email}</span
        >
      {:else}
        <a
          href="http://localhost:8080/auth/sso"
          class="block px-4 py-2 hover:bg-green-500 hover:text-green-100"
          >Sign In</a
        >

        <!-- <button
          on:click={signin}
          class="block px-4 py-2 w-full hover:bg-green-500 hover:text-green-100 text-left"
          >Sign In</button
        > -->
      {/if}
      <a
        href="/settings"
        class="block px-4 py-2 hover:bg-green-500 hover:text-green-100"
        >Settings</a
      >
      {#if user.email}
        <!-- <a
          href="/auth/signout"
          class="block px-4 py-2 hover:bg-green-500 hover:text-green-100"
          >Sign Out</a
        > -->

        <a
          href="http://localhost:8080/auth/signout"
          class="block px-4 py-2 hover:bg-green-500 hover:text-green-100"
          >Sign Out</a
        >
      {/if}
    </div>
  {/if}

  <!-- <Icon src={User} class="text-red-500" /> -->
</div>
