import { parseWithBigInt } from '$lib/utilities/parse-with-big-int';

export type ExtractedImage = {
  key: string;
  dataUri: string;
};

const IMAGE_DATA_URI_PREFIX =
  /^data:image\/(png|jpeg|gif|webp|svg\+xml);base64,.+/;

const MAX_IMAGES = 10;
const MAX_URI_LENGTH = 10 * 1024 * 1024;

function walk(value: unknown, path: string, results: ExtractedImage[]): void {
  if (results.length >= MAX_IMAGES) return;

  if (typeof value === 'string') {
    if (
      value.length > 25 &&
      value.length <= MAX_URI_LENGTH &&
      value.startsWith('data:image/') &&
      IMAGE_DATA_URI_PREFIX.test(value.slice(0, 100))
    ) {
      results.push({ key: path, dataUri: value });
    }
    return;
  }

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      if (results.length >= MAX_IMAGES) return;
      walk(value[i], `${path}[${i}]`, results);
    }
    return;
  }

  if (value !== null && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (results.length >= MAX_IMAGES) return;
      walk(v, path ? `${path}.${k}` : k, results);
    }
  }
}

export function extractImageDataUris(jsonString: string): ExtractedImage[] {
  const results: ExtractedImage[] = [];
  try {
    const parsed = parseWithBigInt(jsonString);
    walk(parsed, '', results);
  } catch {
    // graceful degradation
  }
  return results;
}
