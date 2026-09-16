<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M7.306 14.537H3.564V1.464h3.742zm4.347 0H7.91V1.464h3.742zm4.347 0h-3.742V1.464H16zM5.046 13.055h.778V2.945h-.778zm4.347 0h.778V2.945h-.778zm4.347 0h.778V2.945h-.778zm-11-5.596.53.526-.53.525-1.695 1.683L0 9.14l1.166-1.156L0 6.828l1.045-1.052z"
  />
</IconSvgWrapper>
