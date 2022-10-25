<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';

  export let Hst: HST;
</script>

<Hst.Story>
  <!-- <CodeBlock
    content={stringifyWithBigInt(
      { foo: 'bar', baz: false, blue: 42 },
      undefined,
      2,
    )}
  /> -->
</Hst.Story>
