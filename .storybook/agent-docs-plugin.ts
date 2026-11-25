import { join } from 'node:path';

import type { Plugin } from 'vite';

import {
  agentDocsPaths,
  buildLlmsFull,
  buildLlmsIndex,
  loadPages,
  servedPageMarkdown,
} from './agent-docs';

const isDocsSource = (path: string) =>
  path.endsWith('.md') || path.endsWith('.stories.svelte');

const isAgentDocsPath = (pathname: string) =>
  pathname === agentDocsPaths.index ||
  pathname === agentDocsPaths.full ||
  /^\/io\/[^/]+\.md$/.test(pathname);

function agentDocsFiles(root: string): Map<string, string> {
  const pages = loadPages(root);
  return new Map([
    [agentDocsPaths.index, buildLlmsIndex(pages)],
    [agentDocsPaths.full, buildLlmsFull(pages)],
    ...pages.map(
      (page) =>
        [agentDocsPaths.page(page.slug), servedPageMarkdown(page)] as const,
    ),
  ]);
}

export function agentDocsPlugin(root: string): Plugin {
  return {
    name: 'io-agent-docs',
    configureServer(server) {
      const ioDirectory = join(root, 'src', 'lib', 'io');
      let files: Map<string, string> | undefined;
      server.watcher.on('all', (_event, path) => {
        if (path.startsWith(ioDirectory) && isDocsSource(path)) {
          files = undefined;
        }
      });

      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost')
          .pathname;
        if (!isAgentDocsPath(pathname)) return next();
        files ??= agentDocsFiles(root);
        const body = files.get(pathname);
        if (body === undefined) return next();
        response.setHeader('Content-Type', 'text/plain; charset=utf-8');
        response.end(body);
      });
    },
    generateBundle() {
      for (const [path, source] of agentDocsFiles(root)) {
        this.emitFile({ type: 'asset', fileName: path.slice(1), source });
      }
    },
  };
}
