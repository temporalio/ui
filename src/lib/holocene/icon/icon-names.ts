export const iconNames = Object.keys(
  import.meta.glob('./svg/*.svelte', {
    eager: true,
    import: 'default',
  }),
).map((icon) => icon.match(/([^/]+)\.svelte$/)[1]);

export default iconNames;
