<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0m0 1.495a6.506 6.506 0 1 0 0 13.01 6.506 6.506 0 0 0 0-13.01m1.952 1.547c1.5 0 2.25 1.813 1.19 2.873L9.057 7.999l2.086 2.086c1.06 1.06.308 2.873-1.191 2.873H6.048c-1.5 0-2.25-1.813-1.19-2.873L6.942 8 4.857 5.915c-1.06-1.06-.308-2.873 1.191-2.873zm-4.037 8.1a.189.189 0 0 0 .133.322h3.904a.189.189 0 0 0 .133-.322L8 9.057zm.133-6.606a.189.189 0 0 0-.133.322L8 6.943l2.085-2.085a.189.189 0 0 0-.133-.322z"
  />
</IconSvgWrapper>
