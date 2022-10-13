<script lang="ts">
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
  import type { Hst as HST } from '@histoire/plugin-svelte';
  import CodeBlock from './code-block.svelte';

  export let Hst: HST;
</script>

<Hst.Story>
  <CodeBlock
    content={stringifyWithBigInt(
      { foo: 'bar', baz: false, blue: 42 },
      undefined,
      2,
    )}
  />
</Hst.Story>
