import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { afterEach, describe, expect, it } from 'vitest';

import { getLineBreakExtension } from './custom-extensions';

describe('getLineBreakExtension', () => {
  let view: EditorView;

  afterEach(() => {
    view?.destroy();
  });

  it('should not mutate document content containing \\n escape sequences', async () => {
    const content = '{"key":"Hello\\nworld"}';

    view = new EditorView({
      state: EditorState.create({
        doc: content,
        extensions: [getLineBreakExtension(false)],
      }),
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(view.state.doc.toString()).toBe(content);
  });

  it('should not mutate document content with multiple \\n sequences', async () => {
    const content = '{"key":"line1\\nline2\\nline3"}';

    view = new EditorView({
      state: EditorState.create({
        doc: content,
        extensions: [getLineBreakExtension(false)],
      }),
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(view.state.doc.toString()).toBe(content);
  });

  it('should not mutate document content with even backslashes before n', async () => {
    const content = '{"key":"Hello\\\\nworld"}';

    view = new EditorView({
      state: EditorState.create({
        doc: content,
        extensions: [getLineBreakExtension(false)],
      }),
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(view.state.doc.toString()).toBe(content);
  });

  it('should preserve valid JSON after extension processes content', async () => {
    const content = '{"message":"Hello\\nworld","count":1}';

    view = new EditorView({
      state: EditorState.create({
        doc: content,
        extensions: [getLineBreakExtension(false)],
      }),
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(() => JSON.parse(view.state.doc.toString())).not.toThrow();
  });

  it('should return empty array when editable is true', () => {
    const result = getLineBreakExtension(true);

    expect(result).toEqual([]);
  });
});
