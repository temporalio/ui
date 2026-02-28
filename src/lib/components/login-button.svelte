<script lang="ts">
  import { gotoResolved } from '$lib/utilities/goto-resolved';
  import { routeForLoginPage } from '$lib/utilities/route-for';
</script>

<button
  class="login-button min-w-min"
  on:click={() => gotoResolved(routeForLoginPage())}
>
  Login
</button>

<style lang="postcss">
  .login-button {
    @apply flex items-center justify-center px-4 py-2 text-sm text-white;
  }

  .login-button:hover {
    @apply rounded-md bg-purple-100 text-primary;
  }
</style>
