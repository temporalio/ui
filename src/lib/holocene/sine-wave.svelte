<script lang="ts">
  import type { WorkflowStatus } from '$lib/types/workflows';

  export let status: WorkflowStatus = 'Running';
  export let paused = false;
</script>

<div class="relative m-auto w-full">
  <div class="max-h-[40px] w-full overflow-hidden">
    <svg
      class="relative max-h-[40px] w-[200%]"
      class:animate-wave={status === 'Running' && !paused}
      viewBox="0 0 400 40"
      preserveAspectRatio="none"
    >
      <path
        d="
          M 0 20 C 50 -20 50 60 100 20 
          C 150 -20 150 60 200 20 
          C 250 -20 250 60 300 20 
          C 350 -20 350 60 400 20"
        class={status}
        stroke-width="3"
        fill="transparent"
      />
    </svg>
  </div>
</div>

<style lang="postcss">
  .animate-wave {
    animation: wave linear 3s infinite;
  }

  @keyframes wave {
    from {
      left: -25%;
    }

    to {
      left: -75%;
    }
  }

  .Completed {
    stroke: #aeffd7;
  }

  .Failed {
    stroke: #ffc3a8;
  }

  .Signaled {
    stroke: #d300d8;
  }

  .Fired {
    stroke: #f8a208;
  }

  .TimedOut {
    stroke: #f97316;
  }

  .Canceled {
    stroke: #c9d8f0;
  }

  .Terminated {
    stroke: #fde989;
  }

  .Running {
    stroke: #3b82f6;
  }
</style>
