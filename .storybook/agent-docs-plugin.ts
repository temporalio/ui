import type { Plugin } from 'vite';

import {
  agentDocsPaths,
  buildLlmsFull,
  buildLlmsIndex,
  loadPages,
  servedPageMarkdown,
} from './agent-docs';

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
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost')
          .pathname;
        if (!isAgentDocsPath(pathname)) return next();
        const body = agentDocsFiles(root).get(pathname);
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
