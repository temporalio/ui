<script
  lang="ts"
  generics="E extends keyof SvelteHTMLElements, Namespace extends I18nNamespace | undefined"
>
  import { translate } from '$lib/i18n/translate';

  import type { SvelteHTMLElements } from 'svelte/elements';

  import type { I18nKey, I18nNamespace } from '$lib/i18n';

  type $$Props = SvelteHTMLElements[E] & {
    as?: E;
    namespace?: Namespace;
    translation: Namespace extends I18nNamespace ? I18nKey<Namespace> : never;
  };

  export let as: keyof SvelteHTMLElements = 'div';
  export let namespace: Namespace = undefined;
  export let translation: I18nKey<Namespace> | undefined = undefined;
</script>

<svelte:element
  this={as}
  {...$$restProps}
  on:copy
  on:cut
  on:paste
  on:compositionend
  on:compositionstart
  on:compositionupdate
  on:focus
  on:focusin
  on:focusout
  on:blur
  on:beforeinput
  on:input
  on:reset
  on:submit
  on:invalid
  on:formdata
  on:load
  on:error
  on:toggle
  on:keydown
  on:keypress
  on:keyup
  on:abort
  on:canplay
  on:canplaythrough
  on:cuechange
  on:durationchange
  on:emptied
  on:encrypted
  on:ended
  on:loadeddata
  on:loadedmetadata
  on:loadstart
  on:pause
  on:play
  on:playing
  on:progress
  on:ratechange
  on:seeked
  on:seeking
  on:stalled
  on:suspend
  on:timeupdate
  on:volumechange
  on:waiting
  on:auxclick
  on:click
  on:contextmenu
  on:dblclick
  on:drag
  on:dragend
  on:dragenter
  on:dragexit
  on:dragleave
  on:dragover
  on:dragstart
  on:drop
  on:mousedown
  on:mouseenter
  on:mouseleave
  on:mousemove
  on:mouseout
  on:mouseover
  on:mouseup
  on:select
  on:selectionchange
  on:selectstart
  on:touchcancel
  on:touchend
  on:touchmove
  on:touchstart
  on:gotpointercapture
  on:pointercancel
  on:pointerdown
  on:pointerenter
  on:pointerleave
  on:pointermove
  on:pointerout
  on:pointerover
  on:pointerup
  on:lostpointercapture
  on:scroll
  on:resize
  on:wheel
  on:animationstart
  on:animationend
  on:animationiteration
  on:transitionstart
  on:transitionrun
  on:transitionend
  on:transitioncancel
  on:outrostart
  on:outroend
  on:introstart
  on:introend
  on:message
  on:messageerror
  on:cancel
  on:close
  on:fullscreenchange
  on:fullscreenerror
>
  <slot translation={translate(namespace, translation)} />
</svelte:element>
