import type { Application, Texture } from 'pixi.js';
import { Container, Graphics, RenderTexture } from 'pixi.js';

export type { PixiIconName } from './icon-svgs';
export { PIXI_TYPE_TO_ICON } from './icon-svgs';
import { ICON_DEFS, type PixiIconName } from './icon-svgs';

// Build icon SVG string for Pixi's Graphics.svg() which takes a full SVG document string.
// All shapes are white so Sprite.tint can be used to recolor per event.
function buildPixiIconSvg(name: PixiIconName): string {
  const def = ICON_DEFS[name];
  let inner = '';
  for (const d of def.paths) inner += `<path d="${d}" fill="#ffffff"/>`;
  if (def.circles) {
    for (const c of def.circles)
      inner += `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="#ffffff"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${inner}</svg>`;
}

// Render all icon types to white RenderTextures (iconSize×iconSize).
// Sprites using these textures can be tinted via Sprite.tint.
export function buildIconTextures(
  app: Application,
  iconSize: number,
): Record<PixiIconName, Texture> {
  const result = {} as Record<PixiIconName, Texture>;
  const scale = iconSize / 24;

  for (const name of Object.keys(ICON_DEFS) as PixiIconName[]) {
    const gfx = new Graphics();
    try {
      gfx.svg(buildPixiIconSvg(name));
    } catch {
      gfx.destroy();
      continue;
    }
    const wrapper = new Container();
    wrapper.scale.set(scale);
    wrapper.addChild(gfx);

    const rt = RenderTexture.create({
      width: iconSize,
      height: iconSize,
      resolution: app.renderer.resolution,
    });
    app.renderer.render({ container: wrapper, target: rt });
    wrapper.destroy({ children: true });
    result[name] = rt;
  }

  return result;
}
