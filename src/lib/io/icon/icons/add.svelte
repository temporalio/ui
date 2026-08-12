<script lang="ts">
  import type { ComponentProps } from 'svelte';

  import IconSvgWrapper from '../icon-svg-wrapper.svelte';

  const props: Omit<
    ComponentProps<typeof IconSvgWrapper>,
    'children'
  > = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    fill-rule="evenodd"
    d="M8.833 8.833v5.834H7.167V8.833H1.333V7.167h5.834V1.333h1.666v5.834h5.834v1.666z"
    clip-rule="evenodd"
  />
</IconSvgWrapper>
