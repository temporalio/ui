<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M11.891 7.256h1.087l-.543-.544 1.052-1.052L15.3 7.474l.526.526-.526.526-1.813 1.814-.527-.526-.526-.526.544-.544H11.89V16H2.24V9.813h1.487v4.699h6.675V1.488H3.728v4.697H2.24V0h9.651zM9.333 8.68H.263V7.192h9.07z"
  />
</IconSvgWrapper>
