<script lang="ts">
  import { page } from '$app/stores';

  import LogoutButton from '$lib/components/logout-button.svelte';
  import LoginButton from '$lib/components/login-button.svelte';

  export let user: User;
</script>

{#if user?.email}
  <LogoutButton {user} />
{:else if $page.stuff?.settings.auth.enabled}
  <LoginButton />
{/if}
