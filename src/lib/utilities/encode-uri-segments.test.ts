import { encodeURISegments } from './encode-uri-segments';

describe('encodeURISegments', () => {
  it('should not modify a URI that does not need to be encoded', () => {
    expect(encodeURISegments('/hello/world')).toBe('/hello/world');
  });

  it('should replace hashes', () => {
    expect(encodeURISegments('/workflows/adef##lol')).toBe(
      '/workflows/adef%23%23lol',
    );
  });

  it('should ignore query params', () => {
    expect(encodeURISegments('/workflows/adef##lol?hello=world')).toBe(
      '/workflows/adef%23%23lol?hello=world',
    );
  });
});
