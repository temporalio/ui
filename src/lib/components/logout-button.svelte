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
      class="mr-2.5 h-6 w-6 rounded-full"
    />
    Logout
  </button>
{/if}

<style lang="postcss">
  .logout-button {
    @apply flex items-center justify-center rounded-full px-4 py-2 text-sm text-white;
  }

  .logout-button:hover {
    @apply rounded-md bg-purple-100 text-gray-900;
  }
</style>
