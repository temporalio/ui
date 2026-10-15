const assetHash =
  /(\/assets\/[^?\s"'():]+?)-[A-Za-z0-9_-]{8,}(?=\.(?:css|js|map|svg|woff2?))/g;
const svelteKitChunkHash =
  /(\/_app\/immutable\/chunks\/)[A-Za-z0-9_-]{8,}(?=\.(?:css|js))/g;
const svelteKitNamedHash =
  /(\/_app\/immutable\/(?:entry|nodes)\/[^.?\s"'():]+)[._][A-Za-z0-9_-]{8,}(?=\.(?:css|js))/g;

const replaceOrigins = (value: string, origins: readonly string[]): string => {
  return [...origins]
    .sort((left, right) => right.length - left.length)
    .reduce(
      (normalized, origin) =>
        normalized.replaceAll(origin.replace(/\/$/, ''), '<app-origin>'),
      value,
    );
};

export const normalizeEvidenceText = (
  value: string,
  origins: readonly string[],
): string => {
  return replaceOrigins(value, origins)
    .replace(assetHash, '$1-<hash>')
    .replace(svelteKitChunkHash, '$1<hash>')
    .replace(svelteKitNamedHash, '$1.<hash>');
};

export const normalizeEvidenceUrl = (
  value: string,
  origins: readonly string[],
): string => {
  return normalizeEvidenceText(value, origins);
};

export const normalizeSemanticText = (value: string): string => {
  return value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
};

export const consoleMessagesForParity = <
  Message extends { type: string; text: string },
  Classification extends string,
>(
  messages: readonly Message[],
  classify: (text: string) => Classification | null,
) => {
  return messages.map((message) => {
    const classification =
      message.type === 'error' ? classify(message.text) : null;

    return classification ? { type: message.type, classification } : message;
  });
};
