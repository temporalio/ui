<script lang="ts">
  import { goto } from '$app/navigation';

  import { routeForLoginPage } from '$lib/utilities/route-for';
</script>

<button
  class="login-button h-control min-w-min rounded-control border border-transparent bg-interactive px-4 text-sm font-medium text-white shadow-raised transition-colors duration-fast hover:bg-interactive-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--color-surface-primary))]"
  onclick={() => goto(routeForLoginPage())}
>
  Login
</button>
