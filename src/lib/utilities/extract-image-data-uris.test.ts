import { describe, expect, it } from 'vitest';

import { extractImageDataUris } from './extract-image-data-uris';

const PNG_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==';
const JPEG_URI = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
const GIF_URI = 'data:image/gif;base64,R0lGODlhAQABAIAAAP==';
const WEBP_URI = 'data:image/webp;base64,UklGRiYAAABXRUJQ';
const SVG_URI = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0=';

describe('extractImageDataUris', () => {
  it('extracts a single image from a flat object', () => {
    const json = JSON.stringify({ imageUrl: PNG_URI });
    const result = extractImageDataUris(json);
    expect(result).toEqual([{ key: 'imageUrl', dataUri: PNG_URI }]);
  });

  it('extracts multiple images from nested objects', () => {
    const json = JSON.stringify({
      result: { primary: PNG_URI, secondary: JPEG_URI },
    });
    const result = extractImageDataUris(json);
    expect(result).toEqual([
      { key: 'result.primary', dataUri: PNG_URI },
      { key: 'result.secondary', dataUri: JPEG_URI },
    ]);
  });

  it('extracts images from arrays', () => {
    const json = JSON.stringify({ images: [PNG_URI, JPEG_URI] });
    const result = extractImageDataUris(json);
    expect(result).toEqual([
      { key: 'images[0]', dataUri: PNG_URI },
      { key: 'images[1]', dataUri: JPEG_URI },
    ]);
  });

  it('supports all image MIME types', () => {
    const json = JSON.stringify({
      png: PNG_URI,
      jpeg: JPEG_URI,
      gif: GIF_URI,
      webp: WEBP_URI,
      svg: SVG_URI,
    });
    const result = extractImageDataUris(json);
    expect(result).toHaveLength(5);
  });

  it('returns empty array for JSON without images', () => {
    const json = JSON.stringify({ name: 'test', count: 42 });
    expect(extractImageDataUris(json)).toEqual([]);
  });

  it('returns empty array for invalid JSON', () => {
    expect(extractImageDataUris('not json')).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(extractImageDataUris('')).toEqual([]);
  });

  it('ignores non-image data URIs', () => {
    const json = JSON.stringify({
      file: 'data:application/pdf;base64,abc123',
    });
    expect(extractImageDataUris(json)).toEqual([]);
  });

  it('ignores partial matches and non-data-uri strings', () => {
    const json = JSON.stringify({
      text: 'data:image/png;base64,',
      url: 'https://example.com/image.png',
      partial: 'data:image/png;notbase64,abc',
      tooShort: 'data:image/png;base64,A',
    });
    expect(extractImageDataUris(json)).toEqual([]);
  });

  it('respects the 10-image cap', () => {
    const images: Record<string, string> = {};
    for (let i = 0; i < 15; i++) {
      images[`img${i}`] = PNG_URI;
    }
    const json = JSON.stringify(images);
    const result = extractImageDataUris(json);
    expect(result).toHaveLength(10);
  });

  it('skips URIs exceeding 10MB', () => {
    const largeUri = `data:image/png;base64,${'A'.repeat(11 * 1024 * 1024)}`;
    const json = JSON.stringify({ big: largeUri, small: PNG_URI });
    const result = extractImageDataUris(json);
    expect(result).toEqual([{ key: 'small', dataUri: PNG_URI }]);
  });

  it('handles a top-level string value', () => {
    const json = JSON.stringify(PNG_URI);
    const result = extractImageDataUris(json);
    expect(result).toEqual([{ key: '', dataUri: PNG_URI }]);
  });
});
