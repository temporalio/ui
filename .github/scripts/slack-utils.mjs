export const escapeSlackMrkdwn = (text) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/([*_~`])/g, '\u200B$1');

export const requireEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const requireJsonEnv = (name) => {
  const raw = requireEnv(name);
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON in environment variable: ${name}`);
  }
};
