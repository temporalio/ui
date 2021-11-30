<script lang="ts">
  // import { TemporalColors } from '../../../theme';
  let TemporalColors = {};
  import ColorRenderer from './components/color-renderer.svelte';
</script>

<div class="px-20">
  <ColorRenderer colors={TemporalColors} />
</div>

<slot />
