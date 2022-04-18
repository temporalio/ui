<script lang="ts">
  import { goto } from '$app/navigation';

  export let user: User;
</script>

{#if user?.email}
  <button
    class="logout-button min-w-min"
    on:click={() => goto(import.meta.env.VITE_API + '/auth/logout')}
  >
    <img
      src={user.picture}
      alt="User Avatar"
      class="rounded-full h-6 w-6 mr-2.5"
    />
    Logout
  </button>
{/if}

<style lang="postcss">
  .logout-button {
    @apply px-4 py-2 text-sm text-white flex items-center justify-center;
  }

  .logout-button:hover {
    @apply bg-purple-100 rounded-md text-gray-900;
  }
</style>
