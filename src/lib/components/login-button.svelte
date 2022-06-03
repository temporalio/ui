<script lang="ts">
  import { goto } from '$app/navigation';
  import { routeForLoginPage } from '$lib/utilities/route-for';
</script>

<button
  class="login-button min-w-min"
  on:click={() => goto(routeForLoginPage())}
>
  Login
</button>

<style lang="postcss">
  .login-button {
    @apply flex items-center justify-center rounded-full px-4 py-2 text-sm text-white;
  }

  .login-button:hover {
    @apply rounded-md bg-purple-100 text-gray-900;
  }
</style>
