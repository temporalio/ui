<script lang="ts">
  import { onDestroy } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    dismissSessionWarning,
    sessionWarningState,
  } from '$lib/stores/session-warning';
  import { refreshTokens } from '$lib/utilities/auth-refresh';
  import { logout } from '$lib/stores/auth-user';

  const WARNING_SECONDS = 60;

  let countdown = WARNING_SECONDS;
  let extending = false;
  let dialogEl: HTMLDialogElement;
  let countdownInterval: ReturnType<typeof setInterval> | null = null;

  $: isWarning = $sessionWarningState === 'warning';
  $: isExpired = $sessionWarningState === 'expired';
  $: open = isWarning || isExpired;

  $: if (open && dialogEl) {
    dialogEl.showModal();
  } else if (!open && dialogEl) {
    dialogEl.close();
  }

  $: if (isWarning) {
    countdown = WARNING_SECONDS;
    startCountdown();
  } else {
    stopCountdown();
  }

  function startCountdown() {
    stopCountdown();
    countdownInterval = setInterval(() => {
      countdown -= 1;
      if (countdown <= 0) {
        stopCountdown();
        sessionWarningState.set('expired');
      }
    }, 1000);
  }

  function stopCountdown() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }

  async function handleExtend() {
    extending = true;
    const refreshed = await refreshTokens();
    extending = false;
    if (refreshed) {
      dismissSessionWarning();
    } else {
      sessionWarningState.set('expired');
    }
  }

  async function handleSignOut() {
    await logout();
  }

  onDestroy(stopCountdown);
</script>

<dialog
  bind:this={dialogEl}
  role="alertdialog"
  aria-modal="true"
  aria-labelledby="session-warning-title"
  aria-describedby="session-warning-body"
  data-testid="session-warning-modal"
  class="surface-primary z-50 w-full max-w-lg overflow-y-auto border border-secondary p-0 text-primary shadow-xl backdrop:bg-black/50"
>
  <div class="px-8 pb-0 pt-8 text-2xl">
    <h2 id="session-warning-title">
      {isExpired
        ? translate('common.session-expired-title')
        : translate('common.session-warning-title')}
    </h2>
  </div>
  <div class="whitespace-normal p-8">
    <p id="session-warning-body">
      {isExpired
        ? translate('common.session-expired-body')
        : translate('common.session-warning-body', { seconds: countdown })}
    </p>
    {#if isWarning}
      <p aria-live="polite" aria-atomic="true" class="sr-only">
        {translate('common.session-warning-body', { seconds: countdown })}
      </p>
    {/if}
  </div>
  <div class="flex items-center justify-end gap-2 p-6">
    {#if isExpired}
      <Button variant="primary" on:click={handleSignOut}>
        {translate('common.session-expired-sign-in-again')}
      </Button>
    {:else}
      <Button variant="ghost" on:click={handleSignOut}>
        {translate('common.session-warning-sign-out')}
      </Button>
      <Button variant="primary" loading={extending} on:click={handleExtend}>
        {translate('common.session-warning-extend')}
      </Button>
    {/if}
  </div>
</dialog>
