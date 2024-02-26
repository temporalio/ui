<script lang="ts">
  import { afterUpdate, createEventDispatcher, onDestroy } from 'svelte';

  import type { LayerEvents, Render } from './types';

  import { getRegisterLayer } from './canvas.svelte';

  export let setup: Render | undefined = undefined;
  export let render: Render = () => undefined;

  const dispatcher = createEventDispatcher<LayerEvents>();
  const register = getRegisterLayer();
  const layer = { setup, render, dispatcher };

  const { layerId, unregister, redraw } = register(layer);

  afterUpdate(redraw);
  onDestroy(unregister);
</script>

<div data-layer-id={layerId} />
