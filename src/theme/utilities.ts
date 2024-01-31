const removeHexPrefix = (hex: `#${string}`) => hex.replace('#', '');

export const rgb = (hexColor: `#${string}`): RGB => {
  let hex = removeHexPrefix(hexColor);
  hex = hex.length === 3 ? hex.replace(/./g, '$&$&') : hex;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
};

export const css = (variable: Variables) => `rgb(var(${variable}))`;
