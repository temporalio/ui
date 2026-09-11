<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m.65 12.574 3.314 2.896.607.53 1.211-1.058-.607-.53-1.85-1.62H16v-1.497H3.325l1.964-1.716.607-.53-1.21-1.058-.607.53L.65 11.516l-.607.53.607.531zm14.696-7.987.608-.53-.608-.531L11.918.53 11.31 0l-1.207 1.06.607.531 1.964 1.716H0v1.498h12.675l-1.964 1.716-.607.53 1.21 1.058.607-.53 3.429-2.996z"
  />
</IconSvgWrapper>
