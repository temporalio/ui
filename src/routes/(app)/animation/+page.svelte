<script>
  import Icon from '$lib/holocene/icon/icon.svelte';

  const steps = [
    { class: 'running', label: 'Start' },
    { class: 'timer', label: 'Sleep' },
    { class: 'child', label: 'Child x3' },
    { class: 'signal', label: 'Signal' },
    { class: 'completed', label: 'Activity x15' },
    { class: 'timer', label: 'Sleep' },
    { class: 'completed', label: 'Completed' },
  ];
</script>

<div class="flex h-full w-full flex-col items-center justify-center pt-24">
  <Icon name="animation" {steps} />
</div>
