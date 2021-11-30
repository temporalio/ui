<script lang="typescript">
  import colors from 'tailwindcss/colors';
  import ColorRenderer from './components/color-renderer.svelte';
</script>

<div class="px-20">
  <ColorRenderer {colors} />
</div>

<slot />
