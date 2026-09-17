<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m6.565 8.092 3.531-3.531 4.342 6.202V8.347h1.364v4.434h-1.51l-.072.05-.034-.05h-2.818v-1.364h1.862L9.911 6.675l-3.29 3.291L0 4.081l.906-1.02z"
  />
</IconSvgWrapper>
