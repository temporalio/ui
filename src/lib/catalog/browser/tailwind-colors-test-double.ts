/**
 * The CodeMirror theme reads a single colour from tailwindcss/colors, which
 * ships CommonJS. Pre-bundling it made the catalog harnesses slow enough to
 * time out their setup hook, and no catalog assertion depends on the value.
 */
const shades = new Proxy(
  {},
  {
    get: () => '#000000',
  },
);

export default new Proxy(
  {},
  {
    get: () => shades,
  },
);
