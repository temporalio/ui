<script>
  import Icon from '$lib/holocene/icon/icon.svelte';
  import BoxAnimation from '$lib/holocene/icon/svg/box-animation.svelte';

  const steps = [
    { class: 'running', label: 'Start' },
    { class: 'signal', label: 'Prompt' },
    { class: 'pending', label: 'Activity' },
    { class: 'signal', label: 'Prompt' },
    { class: 'pending', label: 'Activity' },
    { class: 'signal', label: 'Prompt' },
    { class: 'completed', label: 'Activity' },
    { class: 'signal', label: 'Prompt' },
    { class: 'pending', label: 'Activity' },
    { class: 'signal', label: 'Prompt' },
    { class: 'completed', label: 'Activity' },
    { class: 'signal', label: 'Prompt' },
    { class: 'pending', label: 'Activity' },

    { class: 'running', label: 'Running' },
  ];

  const boxSteps = [
    'update',
    'signal',
    'timer',
    'child',
    'child',
    'activity',
    'signal',
    'activity',
    'signal',
    'activity',
    'signal',
    'activity',
    'signal',
    'activity',
    'activity',
    'activity',
    'signal',
    'activity',
    'timer',
  ];
</script>

<div class="flex">
  <div class="flex h-full w-1/2 flex-col items-center justify-center pt-24">
    <BoxAnimation steps={boxSteps} />
  </div>
  <div class="flex h-full w-1/2 flex-col items-center justify-center pt-24">
    <Icon name="animation" {steps} delay={150} width={400} height={400} />
    <Icon name="animation" {steps} delay={150} width={200} height={200} />
    <Icon name="animation" {steps} delay={150} width={100} height={100} />
  </div>
</div>
