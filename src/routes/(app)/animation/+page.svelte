<script>
  import Icon from '$lib/holocene/icon/icon.svelte';

  const steps = [
    { class: 'running', label: 'Start' },
    { class: 'timer', label: 'Sleep' },
    { class: 'child', label: 'Child' },
    { class: 'child', label: 'Child' },
    { class: 'child', label: 'Child' },
    { class: 'signal', label: 'Signal' },
    { class: 'completed', label: 'Activity' },
    { class: 'completed', label: 'Activity' },
    { class: 'completed', label: 'Activity' },
    { class: 'completed', label: 'Activity' },
    { class: 'completed', label: 'Activity' },
    { class: 'completed', label: 'Activity' },
    { class: 'child', label: 'Child' },
    { class: 'signal', label: 'Signal' },
    { class: 'completed', label: 'Activity' },
    { class: 'timer', label: 'Sleep' },
    { class: 'failed', label: 'Failed' },
  ];
</script>

<div class="flex h-full w-full flex-col items-center justify-center pt-24">
  <Icon name="animation" {steps} delay={150} width={400} height={400} />
  <Icon name="animation" {steps} delay={150} width={200} height={200} />
  <Icon name="animation" {steps} delay={150} width={100} height={100} />
</div>
