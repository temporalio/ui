import { createRawSnippet, flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';

import FileUpload from './file-upload.svelte';

let component: ReturnType<typeof mount> | undefined;

afterEach(() => {
  if (component) unmount(component);
  component = undefined;
  document.body.innerHTML = '';
});

describe('FileUpload', () => {
  it('describes the dropzone with the hint', () => {
    const target = document.body.appendChild(document.createElement('div'));
    component = mount(FileUpload, {
      target,
      props: {
        label: 'Workflow history',
        dropzoneHint: 'JSON, up to 10 MB',
      },
    });
    flushSync();

    const dropzone = target.querySelector('[data-part="dropzone"]');
    const described = (dropzone?.getAttribute('aria-describedby') ?? '')
      .split(' ')
      .map((id) => document.getElementById(id)?.textContent?.trim());
    expect(described).toEqual(['JSON, up to 10 MB']);
  });

  it('describes the dropzone with custom dropzone content', () => {
    const target = document.body.appendChild(document.createElement('div'));
    component = mount(FileUpload, {
      target,
      props: {
        label: 'TLS certificates',
        dropzone: createRawSnippet(() => ({
          render: () => '<span>Two .pem files</span>',
        })),
      },
    });
    flushSync();

    const dropzone = target.querySelector('[data-part="dropzone"]');
    const [id] = (dropzone?.getAttribute('aria-describedby') ?? '').split(' ');
    expect(document.getElementById(id)?.textContent?.trim()).toBe(
      'Two .pem files',
    );
  });
});
