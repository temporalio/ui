<script lang="ts">
  import {
    IconFeather,
    IconPause,
    IconRelationship,
    IconRetry,
    IconStopwatch,
    IconTemporalActivity,
    IconTemporalNexus,
    IconTemporalSignal,
    IconTemporalUpdate,
    IconTemporalWorkflow,
    IconTerminal,
  } from '$lib/io/icon';
</script>

<!--
  PERF: Define all timeline icon paths once as <symbol> elements.
  Each <TimelineIcon> then becomes a single <use href="#ti-{name}"> with no
  branching ({#if} chains / BranchManagers) and no innerHTML parsing ({@html}).
  Symbols are referenced document-wide by any <use href="#ti-{name}">.
  The wrapper <svg> is self-hiding (an inline <svg> would otherwise reserve a
  default 300x150 box), so consumers can drop this in anywhere without styling.

  The glyphs are the Io icon components themselves rather than copied path data,
  so the timeline cannot drift from the same icons the legend renders. Each is
  sized 100% so its viewBox maps 1:1 onto the symbol's, letting <use> scale it
  to whatever viewport the consumer declares.
-->
<svg class="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
  <defs>
    <symbol id="ti-workflow" viewBox="0 0 16 16">
      <IconTemporalWorkflow width="100%" height="100%" />
    </symbol>

    <symbol id="ti-retry" viewBox="0 0 16 16">
      <IconRetry width="100%" height="100%" />
    </symbol>

    <symbol id="ti-pause" viewBox="0 0 16 16">
      <IconPause width="100%" height="100%" />
    </symbol>

    <symbol id="ti-activity" viewBox="0 0 16 16">
      <IconTemporalActivity width="100%" height="100%" />
    </symbol>

    <symbol id="ti-signal" viewBox="0 0 16 16">
      <IconTemporalSignal width="100%" height="100%" />
    </symbol>

    <symbol id="ti-retention" viewBox="0 0 16 16">
      <IconStopwatch width="100%" height="100%" />
    </symbol>

    <symbol id="ti-feather" viewBox="0 0 16 16">
      <IconFeather width="100%" height="100%" />
    </symbol>

    <symbol id="ti-relationship" viewBox="0 0 16 16">
      <IconRelationship width="100%" height="100%" />
    </symbol>

    <symbol id="ti-update" viewBox="0 0 16 16">
      <IconTemporalUpdate width="100%" height="100%" />
    </symbol>

    <symbol id="ti-terminal" viewBox="0 0 16 16">
      <IconTerminal width="100%" height="100%" />
    </symbol>

    <symbol id="ti-nexus" viewBox="0 0 16 16">
      <IconTemporalNexus width="100%" height="100%" />
    </symbol>
  </defs>
</svg>
