<script lang="ts">
  import type { PendingActivity, WorkflowEvent } from '$lib/types/events';
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';
  import { isPendingActivity } from '$lib/utilities/is-pending-activity';

  import Layer from './layer.svelte';

  export let x: number;
  export let y: number;
  export let event: WorkflowEvent | PendingActivity;
  export let onClick: (x: WorkflowEvent | PendingActivity) => void;

  const render = ({ context, width }) => {
    context.font = `${width / 100}px sans-serif`;
    context.textAlign = 'left';
    context.textBaseline = 'start';
    context.fillStyle = '#ffffff';
    if (isPendingActivity(event)) {
      context.fillText(`Pending Activity - Attempt ${event.attempt}`, x, y);
      return;
    } else {
      context.fillText(event.id, x, y);
      context.fillText(
        spaceBetweenCapitalLetters(event?.name) ?? 'Pending',
        50,
        y,
      );
    }
  };

  const onDown = (e) => {
    e.detail.originalEvent.preventDefault();
    onClick(event);
    // dragging = true;
    // radius.set(120);
  };
</script>

<Layer {render} on:mousedown={onDown} />
