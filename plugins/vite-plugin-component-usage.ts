import fs from 'fs';
import path from 'path';

import type { Plugin, ViteDevServer } from 'vite';

const VIRTUAL_MODULE_ID = 'virtual:holocene-usage';
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;

type UsageFile = { path: string; line: number };
type UsageData = Record<string, { count: number; files: UsageFile[] }>;

export function componentUsagePlugin(): Plugin {
  const srcDir = path.resolve('src');
  const componentsJsonPath = path.resolve(
    'src/lib/holocene/holocene-components.json',
  );
  let usageCache: UsageData = {};
  let componentKeys: string[] = [];
  let server: ViteDevServer | undefined;

  function getComponentImportPatterns(key: string): RegExp[] {
    const patterns: RegExp[] = [];
    patterns.push(new RegExp(`from ['"]\\$lib/holocene/${key}\\.svelte['"]`));
    patterns.push(new RegExp(`from ['"]\\$holocene/${key}\\.svelte['"]`));
    patterns.push(
      new RegExp(`from ['"]\\$lib/holocene/[^'"]*/${key}\\.svelte['"]`),
    );
    patterns.push(
      new RegExp(`from ['"]\\$holocene/[^'"]*/${key}\\.svelte['"]`),
    );
    return patterns;
  }

  function scanFile(filePath: string, content?: string): Map<string, number> {
    const matches = new Map<string, number>();
    if (!content) {
      try {
        content = fs.readFileSync(filePath, 'utf-8');
      } catch {
        return matches;
      }
    }
    const lines = content.split('\n');
    for (const key of componentKeys) {
      const importPatterns = getComponentImportPatterns(key);
      for (let i = 0; i < lines.length; i++) {
        if (importPatterns.some((pattern) => pattern.test(lines[i]))) {
          matches.set(key, i + 1);
          break;
        }
      }
    }
    return matches;
  }

  function getAllSvelteFiles(dir: string): string[] {
    const files: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (
          entry.name === 'node_modules' ||
          entry.name === '.svelte-kit' ||
          entry.name === 'dist' ||
          entry.name === 'build'
        )
          continue;
        files.push(...getAllSvelteFiles(fullPath));
      } else if (
        entry.name.endsWith('.svelte') &&
        !entry.name.endsWith('.stories.svelte')
      ) {
        const rel = path.relative(srcDir, fullPath);
        if (!rel.startsWith('routes/fairytale')) {
          files.push(fullPath);
        }
      }
    }
    return files;
  }

  function fullScan(): void {
    try {
      const json = JSON.parse(fs.readFileSync(componentsJsonPath, 'utf-8'));
      componentKeys = Object.keys(json);
    } catch {
      componentKeys = [];
    }

    usageCache = {};
    for (const key of componentKeys) {
      usageCache[key] = { count: 0, files: [] };
    }

    const svelteFiles = getAllSvelteFiles(srcDir);
    for (const file of svelteFiles) {
      const matches = scanFile(file);
      const relPath = path.relative(srcDir, file);
      for (const [key, line] of matches) {
        usageCache[key].count++;
        usageCache[key].files.push({ path: relPath, line });
      }
    }
  }

  function updateFileInCache(filePath: string, content?: string): void {
    const relPath = path.relative(srcDir, filePath);

    for (const key of componentKeys) {
      const idx = usageCache[key].files.findIndex((f) => f.path === relPath);
      if (idx !== -1) {
        usageCache[key].files.splice(idx, 1);
        usageCache[key].count--;
      }
    }

    const matches = scanFile(filePath, content);
    for (const [key, line] of matches) {
      if (!usageCache[key]) {
        usageCache[key] = { count: 0, files: [] };
      }
      usageCache[key].count++;
      usageCache[key].files.push({ path: relPath, line });
    }
  }

  return {
    name: 'holocene-component-usage',
    buildStart() {
      fullScan();
    },
    configureServer(s) {
      server = s;
    },
    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        const data = { basePath: srcDir, usage: usageCache };
        return `export default ${JSON.stringify(data)};`;
      }
    },
    handleHotUpdate({ file, read }) {
      if (!file.endsWith('.svelte') || file.endsWith('.stories.svelte')) return;
      const rel = path.relative(srcDir, file);
      if (rel.startsWith('routes/fairytale')) return;

      Promise.resolve(read()).then((content) => {
        updateFileInCache(file, content);
        if (server) {
          const mod = server.moduleGraph.getModuleById(
            RESOLVED_VIRTUAL_MODULE_ID,
          );
          if (mod) {
            server.moduleGraph.invalidateModule(mod);
          }
        }
      });
    },
  };
}
