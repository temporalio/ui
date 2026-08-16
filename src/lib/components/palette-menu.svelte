<script lang="ts">
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    paletteMetadata,
    type PaletteName,
    paletteNames,
  } from '$lib/theme/palettes';
  import { usePalettePreference } from '$lib/utilities/palette';

  const palettes = paletteNames.map((palette) => ({
    palette,
    ...paletteMetadata[palette],
  }));

  const selectPalette = (palette: PaletteName) => {
    $usePalettePreference = palette;
  };
</script>

<ToggleButtons
  role="group"
  aria-label={translate('common.palette')}
  data-testid="palette-toggle-buttons"
  class="pl-4"
>
  {#each palettes as { palette, labelKey, ariaLabelKey } (palette)}
    <ToggleButton
      aria-label={translate(ariaLabelKey)}
      data-testid={`palette-${palette}`}
      onclick={() => selectPalette(palette)}
      active={$usePalettePreference === palette}
      size="xs"
    >
      {translate(labelKey)}
    </ToggleButton>
  {/each}
</ToggleButtons>
