<script>
  import { fly } from 'svelte/transition';
</script>

<div
  in:fly={{ y: -50, duration: 150, delay: 50 }}
  out:fly={{ y: -50, duration: 150 }}
>
  <slot />
</div>
