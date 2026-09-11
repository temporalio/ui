<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m6.647 7.795 3.576 3.575 4.396-6.28v2.447H16v-4.49h-1.53l-.072-.05-.035.05H11.51v1.381h1.886l-3.36 4.801-3.333-3.332L0 11.856l.917 1.032z"
  />
</IconSvgWrapper>
