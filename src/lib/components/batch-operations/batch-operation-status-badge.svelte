<script lang="ts" module>
  import type { BadgeColorScheme } from '$lib/io/badge';
  import type { BatchOperationState } from '$lib/types/batch';

  const stateColorSchemes: Record<BatchOperationState, BadgeColorScheme> = {
    Completed: 'success',
    Running: 'info',
    Failed: 'danger',
    Unspecified: 'neutral',
  };
</script>

<script lang="ts">
  import { Badge } from '$lib/io/badge';

  interface Props {
    state: BatchOperationState;
    class?: string;
  }

  let { state, class: className }: Props = $props();
</script>

<Badge text={state} colorScheme={stateColorSchemes[state]} class={className} />
