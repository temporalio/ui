<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M8 0a8 8 0 0 1 7.975 7.396H16v1.5h-.05a8 8 0 0 1-15.9 0H0v-1.5h.025A8 8 0 0 1 8 0M6.219 5.524a.25.25 0 0 0-.462.011l-.86 2.238a1.75 1.75 0 0 1-1.633 1.123h-1.7a6.5 6.5 0 0 0 12.873 0h-1.335c-.099 0-.19.06-.229.15l-.94 2.161c-.61 1.398-2.591 1.402-3.206.007zM8 1.5a6.5 6.5 0 0 0-6.472 5.896h1.736a.25.25 0 0 0 .233-.16l.86-2.238c.56-1.458 2.605-1.508 3.235-.08l2.507 5.69a.25.25 0 0 0 .458 0l.941-2.16a1.75 1.75 0 0 1 1.604-1.052h1.37A6.5 6.5 0 0 0 8 1.5"
  />
</IconSvgWrapper>
