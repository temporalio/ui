<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconWarning } from '$lib/io/icon';
  import { namespaceFairness } from '$lib/stores/namespace-fairness';

  interface Props {
    fairnessKey: string;
  }

  let { fairnessKey }: Props = $props();

  let container = $state<HTMLDivElement>();
  let isHovered = $state(false);
  let isFocused = $state(false);
  let dismissed = $state(false);
  const uid = $props.id();
  const popoverId = `fairness-key-popover-${uid}`;
  const isDisabled = $derived($namespaceFairness.enabled === false);
  const isOpen = $derived(isDisabled && !dismissed && (isHovered || isFocused));
  const hasNumber = $derived(/\d/.test(fairnessKey));

  $effect(() => {
    if (!isHovered && !isFocused) dismissed = false;
  });

  function handleFocusOut(event: FocusEvent) {
    const next = event.relatedTarget as HTMLElement | null;
    if (next && container?.contains(next)) return;
    isFocused = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) dismissed = true;
  }
</script>

{#if isDisabled}
  <div
    bind:this={container}
    data-testid="fairness-key-alert"
    role="presentation"
    class="relative inline-flex min-w-0"
    onmouseenter={() => (isHovered = true)}
    onmouseleave={() => (isHovered = false)}
    onfocusin={() => (isFocused = true)}
    onfocusout={handleFocusOut}
  >
    <button
      type="button"
      aria-controls={isOpen ? popoverId : undefined}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      class="inline-flex min-w-0 items-center gap-1 rounded-sm text-left font-mono leading-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary"
    >
      <span class="truncate border-b border-dotted border-current"
        >{fairnessKey}</span
      >
      <span aria-hidden="true" class="flex shrink-0">
        <IconWarning class="text-warning" />
      </span>
      <span class="sr-only">
        {translate('workflows.fairness-disabled-alert')}
      </span>
    </button>

    {#if isOpen}
      <div
        data-testid="fairness-key-popover-bridge"
        class="absolute left-0 top-full z-50 w-72 pt-2"
      >
        <div
          id={popoverId}
          role="dialog"
          aria-label={translate('workflows.fairness-disabled-popover-label')}
          class="rounded bg-neutral-7 p-3 text-sm text-white shadow-lg"
        >
          <p>{translate('workflows.fairness-disabled-description')}</p>
          {#if $namespaceFairness.enableHref}
            <Link href={$namespaceFairness.enableHref} class="mt-2 text-white">
              {translate('workflows.enable-fairness-in-namespace')}
            </Link>
          {/if}
        </div>
      </div>
    {/if}
  </div>
{:else}
  <div class="flex select-all items-center gap-1 truncate rounded-sm">
    <span class="truncate {hasNumber ? 'font-mono' : ''}">{fairnessKey}</span>
  </div>
{/if}

<svelte:window onkeydowncapture={handleKeydown} />
