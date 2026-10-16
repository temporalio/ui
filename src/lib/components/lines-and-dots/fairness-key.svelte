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
  let isPinned = $state(false);
  let dismissed = $state(false);
  const uid = $props.id();
  const popoverId = `fairness-key-popover-${uid}`;
  const isDisabled = $derived($namespaceFairness.enabled === false);
  const isOpen = $derived(
    isDisabled && !dismissed && (isHovered || isFocused || isPinned),
  );
  const hasNumber = $derived(/\d/.test(fairnessKey));

  $effect(() => {
    if (!isHovered && !isFocused && !isPinned) dismissed = false;
  });

  function handleFocusOut(event: FocusEvent) {
    if (
      event.relatedTarget instanceof Node &&
      container?.contains(event.relatedTarget)
    )
      return;
    isFocused = false;
  }

  function handlePointerOut(event: PointerEvent) {
    if (
      event.relatedTarget instanceof Node &&
      container?.contains(event.relatedTarget)
    )
      return;
    isHovered = false;
  }

  function handlePointerDown(event: PointerEvent) {
    if (event.button === 0) isPinned = true;
  }

  function handleClick() {
    isPinned = true;
  }

  function closeIfOutside(target: EventTarget | null) {
    if (target instanceof Node && container?.contains(target)) return;
    isHovered = false;
    isFocused = false;
    isPinned = false;
  }

  function handleWindowPointerDown(event: PointerEvent) {
    closeIfOutside(event.target);
  }

  function handleWindowFocusIn(event: FocusEvent) {
    closeIfOutside(event.target);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      isPinned = false;
      dismissed = true;
    }
  }
</script>

{#if isDisabled}
  <div
    bind:this={container}
    data-testid="fairness-key-alert"
    role="presentation"
    class="relative inline-flex min-w-0"
    onpointerover={() => (isHovered = true)}
    onpointerout={handlePointerOut}
    onfocusin={() => (isFocused = true)}
    onfocusout={handleFocusOut}
  >
    <button
      type="button"
      aria-controls={isOpen ? popoverId : undefined}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      onpointerdown={handlePointerDown}
      onclick={handleClick}
      class="inline-flex min-w-0 items-center gap-1 rounded-sm text-left leading-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary"
    >
      <span
        class="truncate border-b border-dotted border-current {hasNumber
          ? 'font-mono'
          : ''}">{fairnessKey}</span
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
            <div class="mt-2">
              <Link href={$namespaceFairness.enableHref} light>
                {translate('workflows.enable-fairness-in-namespace')}
              </Link>
            </div>
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

<svelte:window
  onkeydowncapture={handleKeydown}
  onpointerdowncapture={handleWindowPointerDown}
  onfocusincapture={handleWindowFocusIn}
/>
