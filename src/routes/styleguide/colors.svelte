<script lang="typescript">
  import colors from 'tailwindcss/colors';
  import ColorRenderer from './components/ColorRenderer.svelte';
</script>

<div class="px-20">
  <ColorRenderer {colors} />
</div>

<slot />
