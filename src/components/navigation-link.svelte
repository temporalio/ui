<script>
  import { page } from '$app/stores';

  $: ({ href, ...inputProps } = $$props);
  $: isActive = href === $page.path;
</script>

<a {href} class:active={isActive}><slot /></a>

<style>
  a.active {
    color: red;
  }
</style>
