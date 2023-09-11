// vite.config.ts
import path from "path";
import { sveltekit } from "file:///Users/alex.tideman/Temporal/ui/node_modules/.pnpm/@sveltejs+kit@1.15.4_svelte@3.55.1_vite@4.0.5/node_modules/@sveltejs/kit/src/exports/vite/index.js";
import { defineConfig } from "file:///Users/alex.tideman/Temporal/ui/node_modules/.pnpm/vite@4.0.5_@types+node@16.18.11/node_modules/vite/dist/node/index.js";

// plugins/vite-plugin-temporal-server.ts
import { chalk as chalk2 } from "file:///Users/alex.tideman/Temporal/ui/node_modules/.pnpm/zx@7.1.1/node_modules/zx/build/index.js";

// utilities/temporal-server.ts
import { join } from "path";
import waitForPort from "file:///Users/alex.tideman/Temporal/ui/node_modules/.pnpm/wait-port@1.0.4/node_modules/wait-port/lib/wait-port.js";
import { $, chalk } from "file:///Users/alex.tideman/Temporal/ui/node_modules/.pnpm/zx@7.1.1/node_modules/zx/build/index.js";
var localCLIPath = join(process.cwd(), "bin", "cli", "temporal");
var warn = (message) => {
  console.warn(`${chalk.bgYellow.black("WARN")}: ${message}`);
};
var getCLIPath = async (cliPath = localCLIPath) => {
  const stylizedPath = chalk.yellowBright(cliPath);
  console.log(chalk.yellow(`Checking Temporal CLI at ${stylizedPath}\u2026`));
  const { stdout, exitCode } = await $`${cliPath} -v`.quiet().nothrow();
  if (exitCode === 0) {
    console.log(
      chalk.greenBright(
        `Temporal CLI found at ${stylizedPath}:
	`,
        "\u2192",
        chalk.green(stdout.trim())
      )
    );
    return cliPath;
  }
  const { stdout: globalPath } = await $`which temporal`.nothrow();
  if (globalPath && cliPath !== globalPath.trim())
    return getCLIPath(globalPath.trim());
  warn("Couldn't find Temporal CLI. Skipping\u2026");
};
var temporalServer;
var createTemporalServer = async ({
  port = 7233,
  uiPort = port + 1e3,
  path: path2 = localCLIPath,
  logLevel = "fatal",
  codecEndpoint,
  headless = false
} = {}) => {
  const cliPath = await getCLIPath(path2);
  const flags = [
    `--port=${port}`,
    `--ui-port=${uiPort}`,
    `--log-level=${logLevel}`
  ];
  if (codecEndpoint) {
    flags.push(`--ui-codec-endpoint=${codecEndpoint}`);
  }
  if (headless) {
    flags.push("--headless");
  }
  const temporal2 = $`${cliPath} server start-dev --dynamic-config-value frontend.workerVersioningDataAPIs=true --dynamic-config-value frontend.workerVersioningWorkflowAPIs=true --dynamic-config-value worker.buildIdScavengerEnabled=true ${flags}`.quiet();
  temporal2.catch(async ({ stdout, stderr, exitCode }) => {
    if (exitCode) {
      try {
        const { error } = JSON.parse(stdout);
        if (error.includes("address already in use")) {
          return warn(
            `Port ${port} is already in use. Falling back to whatever is running on that port.`
          );
        }
        throw new Error(stderr ?? stdout);
      } catch (error) {
        throw new Error(stderr ?? stdout);
      }
    }
  });
  const shutdown = async () => {
    await temporal2.kill();
    console.log("\u{1F52A} killed temporal server");
    return await temporal2.exitCode;
  };
  const ready = async () => {
    const ports = [
      waitForPort({ port, output: "silent" }),
      !headless && waitForPort({ port: uiPort, output: "silent" })
    ];
    const portsPromise = await Promise.all(ports).then((ports2) => {
      console.log(`\u2728 temporal dev server running on port: ${port}`);
      return ports2;
    });
    return portsPromise.every(({ open }) => open);
  };
  temporalServer = {
    ready,
    shutdown
  };
  return temporalServer;
};

// plugins/vite-plugin-temporal-server.ts
var { cyan, magenta } = chalk2;
var temporal;
var shouldSkip = (server) => {
  if (process.env.VERCEL)
    return true;
  if (process.env.HISTOIRE)
    return true;
  if (process.env.VITEST)
    return true;
  if (temporal)
    return true;
  if (process.platform === "win32")
    return true;
  if (server.config.mode === "docker" || server.config.mode.includes("test"))
    return true;
  return false;
};
var getPortFromApiEndpoint = (endpoint, fallback = 8233) => {
  return validatePort(
    endpoint.slice(endpoint.lastIndexOf(":") + 1, endpoint.length),
    fallback
  );
};
var isValidPort = (port) => {
  if (typeof port !== "number")
    return false;
  if (isNaN(port))
    return false;
  if (port <= 1024)
    return false;
  if (port > 65536)
    return false;
  return true;
};
var validatePort = (port, fallback) => {
  port = Number(port);
  if (isValidPort(port))
    return port;
  console.error(`${port} is not a valid port. Falling back to ${fallback}.`);
  if (isValidPort(fallback))
    return fallback;
  throw new Error(
    `Both the provided port, ${port}, and its fallback, ${fallback}, are invalid ports.`
  );
};
function temporalServer2() {
  return {
    name: "vite-plugin-temporal-server",
    enforce: "post",
    apply: "serve",
    async configureServer(server) {
      if (shouldSkip(server))
        return;
      const port = validatePort(server.config.env.VITE_TEMPORAL_PORT, 7233);
      const uiPort = getPortFromApiEndpoint(server.config.env.VITE_API);
      console.log(magenta(`Starting Temporal Server on Port ${port}\u2026`));
      console.log(cyan(`Starting Temporal UI Server on Port ${uiPort}\u2026`));
      temporal = await createTemporalServer({
        port,
        uiPort
      });
      await temporal.ready();
      console.log(magenta(`Temporal Server is running on Port ${port}.`));
      console.log(cyan(`Temporal UI Server is running on Port ${uiPort}.`));
    },
    async closeBundle() {
      await (temporal == null ? void 0 : temporal.shutdown());
    }
  };
}
process.on("beforeExit", async () => {
  if (!temporal)
    return;
  await (temporal == null ? void 0 : temporal.shutdown());
});

// utilities/ui-server.ts
import { join as join2 } from "path";
import waitForPort2 from "file:///Users/alex.tideman/Temporal/ui/node_modules/.pnpm/wait-port@1.0.4/node_modules/wait-port/lib/wait-port.js";
import { $ as $2 } from "file:///Users/alex.tideman/Temporal/ui/node_modules/.pnpm/zx@7.1.1/node_modules/zx/build/index.js";
var uiServer;
var portForEnv = (env) => {
  if (env === "development")
    return 8081;
  if (env === "e2e")
    return 8080;
};
var createUIServer = async (env = "development") => {
  $2.cwd = join2(process.cwd(), "server");
  await $2`make build-server`;
  const uiServerProcess = $2`./ui-server --env ${env} start`.quiet();
  console.log(`\u2728 ui-server running in ${env} mode on port ${portForEnv(env)}`);
  const shutdown = async () => {
    await uiServerProcess.kill();
    console.log("\u{1F52A} killed ui-server");
    return await uiServerProcess.exitCode;
  };
  const ready = async () => {
    return waitForPort2({ port: portForEnv(env), output: "silent" });
  };
  uiServer = {
    shutdown,
    ready
  };
  return uiServer;
};

// plugins/vite-plugin-ui-server.ts
var uiServer2;
var shouldSkip2 = (server) => {
  if (process.env.VERCEL)
    return true;
  if (process.env.HISTOIRE)
    return true;
  if (process.env.VITEST)
    return true;
  if (process.env.CI)
    return true;
  if (server.config.mode === "docker" || server.config.mode === "temporal-server" || server.config.mode.includes("test"))
    return true;
  return false;
};
function uiServerPlugin() {
  return {
    name: "vite-plugin-ui-server",
    enforce: "post",
    apply: "serve",
    async configureServer(server) {
      if (shouldSkip2(server))
        return;
      uiServer2 = await createUIServer();
      await uiServer2.ready();
    },
    async closeBundle() {
      await (uiServer2 == null ? void 0 : uiServer2.shutdown());
    }
  };
}
process.on("beforeExit", async () => {
  if (!uiServer2)
    return;
  await (uiServer2 == null ? void 0 : uiServer2.shutdown());
});

// vite.config.ts
var vite_config_default = defineConfig({
  plugins: [sveltekit(), temporalServer2(), uiServerPlugin()],
  optimizeDeps: {
    include: ["date-fns", "date-fns-tz", "websocket-as-promised"]
  },
  resolve: {
    alias: {
      $types: path.resolve("./src/types"),
      $fixtures: path.resolve("./src/fixtures"),
      $components: path.resolve("./src/lib/components/")
    }
  },
  server: {
    port: 3e3
  },
  preview: {
    port: 3e3
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGx1Z2lucy92aXRlLXBsdWdpbi10ZW1wb3JhbC1zZXJ2ZXIudHMiLCAidXRpbGl0aWVzL3RlbXBvcmFsLXNlcnZlci50cyIsICJ1dGlsaXRpZXMvdWktc2VydmVyLnRzIiwgInBsdWdpbnMvdml0ZS1wbHVnaW4tdWktc2VydmVyLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2FsZXgudGlkZW1hbi9UZW1wb3JhbC91aVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2FsZXgudGlkZW1hbi9UZW1wb3JhbC91aS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvYWxleC50aWRlbWFuL1RlbXBvcmFsL3VpL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7IHN2ZWx0ZWtpdCB9IGZyb20gJ0BzdmVsdGVqcy9raXQvdml0ZSc7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcblxuaW1wb3J0IHsgdGVtcG9yYWxTZXJ2ZXIgfSBmcm9tICcuL3BsdWdpbnMvdml0ZS1wbHVnaW4tdGVtcG9yYWwtc2VydmVyJztcbmltcG9ydCB7IHVpU2VydmVyUGx1Z2luIH0gZnJvbSAnLi9wbHVnaW5zL3ZpdGUtcGx1Z2luLXVpLXNlcnZlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtzdmVsdGVraXQoKSwgdGVtcG9yYWxTZXJ2ZXIoKSwgdWlTZXJ2ZXJQbHVnaW4oKV0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFsnZGF0ZS1mbnMnLCAnZGF0ZS1mbnMtdHonLCAnd2Vic29ja2V0LWFzLXByb21pc2VkJ10sXG4gIH0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJHR5cGVzOiBwYXRoLnJlc29sdmUoJy4vc3JjL3R5cGVzJyksXG4gICAgICAkZml4dHVyZXM6IHBhdGgucmVzb2x2ZSgnLi9zcmMvZml4dHVyZXMnKSxcbiAgICAgICRjb21wb25lbnRzOiBwYXRoLnJlc29sdmUoJy4vc3JjL2xpYi9jb21wb25lbnRzLycpLFxuICAgIH0sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDMwMDAsXG4gIH0sXG4gIHByZXZpZXc6IHtcbiAgICBwb3J0OiAzMDAwLFxuICB9LFxufSk7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9hbGV4LnRpZGVtYW4vVGVtcG9yYWwvdWkvcGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2FsZXgudGlkZW1hbi9UZW1wb3JhbC91aS9wbHVnaW5zL3ZpdGUtcGx1Z2luLXRlbXBvcmFsLXNlcnZlci50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvYWxleC50aWRlbWFuL1RlbXBvcmFsL3VpL3BsdWdpbnMvdml0ZS1wbHVnaW4tdGVtcG9yYWwtc2VydmVyLnRzXCI7aW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB0eXBlIHsgVml0ZURldlNlcnZlciB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgY2hhbGsgfSBmcm9tICd6eCc7XG5cbmltcG9ydCB7XG4gIGNyZWF0ZVRlbXBvcmFsU2VydmVyLFxuICB0eXBlIFRlbXBvcmFsU2VydmVyLFxufSBmcm9tICcuLi91dGlsaXRpZXMvdGVtcG9yYWwtc2VydmVyJztcblxuY29uc3QgeyBjeWFuLCBtYWdlbnRhIH0gPSBjaGFsaztcblxubGV0IHRlbXBvcmFsOiBUZW1wb3JhbFNlcnZlcjtcblxuY29uc3Qgc2hvdWxkU2tpcCA9IChzZXJ2ZXI6IFZpdGVEZXZTZXJ2ZXIpOiBib29sZWFuID0+IHtcbiAgaWYgKHByb2Nlc3MuZW52LlZFUkNFTCkgcmV0dXJuIHRydWU7XG4gIGlmIChwcm9jZXNzLmVudi5ISVNUT0lSRSkgcmV0dXJuIHRydWU7XG4gIGlmIChwcm9jZXNzLmVudi5WSVRFU1QpIHJldHVybiB0cnVlO1xuICBpZiAodGVtcG9yYWwpIHJldHVybiB0cnVlO1xuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJykgcmV0dXJuIHRydWU7XG4gIGlmIChzZXJ2ZXIuY29uZmlnLm1vZGUgPT09ICdkb2NrZXInIHx8IHNlcnZlci5jb25maWcubW9kZS5pbmNsdWRlcygndGVzdCcpKVxuICAgIHJldHVybiB0cnVlO1xuXG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmNvbnN0IGdldFBvcnRGcm9tQXBpRW5kcG9pbnQgPSAoZW5kcG9pbnQ6IHN0cmluZywgZmFsbGJhY2sgPSA4MjMzKTogbnVtYmVyID0+IHtcbiAgcmV0dXJuIHZhbGlkYXRlUG9ydChcbiAgICBlbmRwb2ludC5zbGljZShlbmRwb2ludC5sYXN0SW5kZXhPZignOicpICsgMSwgZW5kcG9pbnQubGVuZ3RoKSxcbiAgICBmYWxsYmFjayxcbiAgKTtcbn07XG5cbmNvbnN0IGlzVmFsaWRQb3J0ID0gKHBvcnQ6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xuICBpZiAodHlwZW9mIHBvcnQgIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gIGlmIChpc05hTihwb3J0KSkgcmV0dXJuIGZhbHNlO1xuICBpZiAocG9ydCA8PSAxMDI0KSByZXR1cm4gZmFsc2U7XG4gIGlmIChwb3J0ID4gNjU1MzYpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIHRydWU7XG59O1xuXG5jb25zdCB2YWxpZGF0ZVBvcnQgPSAocG9ydDogbnVtYmVyIHwgc3RyaW5nLCBmYWxsYmFjazogbnVtYmVyKTogbnVtYmVyID0+IHtcbiAgcG9ydCA9IE51bWJlcihwb3J0KTtcblxuICBpZiAoaXNWYWxpZFBvcnQocG9ydCkpIHJldHVybiBwb3J0O1xuXG4gIGNvbnNvbGUuZXJyb3IoYCR7cG9ydH0gaXMgbm90IGEgdmFsaWQgcG9ydC4gRmFsbGluZyBiYWNrIHRvICR7ZmFsbGJhY2t9LmApO1xuXG4gIGlmIChpc1ZhbGlkUG9ydChmYWxsYmFjaykpIHJldHVybiBmYWxsYmFjaztcblxuICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgYEJvdGggdGhlIHByb3ZpZGVkIHBvcnQsICR7cG9ydH0sIGFuZCBpdHMgZmFsbGJhY2ssICR7ZmFsbGJhY2t9LCBhcmUgaW52YWxpZCBwb3J0cy5gLFxuICApO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHRlbXBvcmFsU2VydmVyKCk6IFBsdWdpbiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3ZpdGUtcGx1Z2luLXRlbXBvcmFsLXNlcnZlcicsXG4gICAgZW5mb3JjZTogJ3Bvc3QnLFxuICAgIGFwcGx5OiAnc2VydmUnLFxuICAgIGFzeW5jIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgIGlmIChzaG91bGRTa2lwKHNlcnZlcikpIHJldHVybjtcblxuICAgICAgY29uc3QgcG9ydCA9IHZhbGlkYXRlUG9ydChzZXJ2ZXIuY29uZmlnLmVudi5WSVRFX1RFTVBPUkFMX1BPUlQsIDcyMzMpO1xuICAgICAgY29uc3QgdWlQb3J0ID0gZ2V0UG9ydEZyb21BcGlFbmRwb2ludChzZXJ2ZXIuY29uZmlnLmVudi5WSVRFX0FQSSk7XG5cbiAgICAgIGNvbnNvbGUubG9nKG1hZ2VudGEoYFN0YXJ0aW5nIFRlbXBvcmFsIFNlcnZlciBvbiBQb3J0ICR7cG9ydH1cdTIwMjZgKSk7XG4gICAgICBjb25zb2xlLmxvZyhjeWFuKGBTdGFydGluZyBUZW1wb3JhbCBVSSBTZXJ2ZXIgb24gUG9ydCAke3VpUG9ydH1cdTIwMjZgKSk7XG5cbiAgICAgIHRlbXBvcmFsID0gYXdhaXQgY3JlYXRlVGVtcG9yYWxTZXJ2ZXIoe1xuICAgICAgICBwb3J0LFxuICAgICAgICB1aVBvcnQsXG4gICAgICB9KTtcblxuICAgICAgYXdhaXQgdGVtcG9yYWwucmVhZHkoKTtcblxuICAgICAgY29uc29sZS5sb2cobWFnZW50YShgVGVtcG9yYWwgU2VydmVyIGlzIHJ1bm5pbmcgb24gUG9ydCAke3BvcnR9LmApKTtcbiAgICAgIGNvbnNvbGUubG9nKGN5YW4oYFRlbXBvcmFsIFVJIFNlcnZlciBpcyBydW5uaW5nIG9uIFBvcnQgJHt1aVBvcnR9LmApKTtcbiAgICB9LFxuICAgIGFzeW5jIGNsb3NlQnVuZGxlKCkge1xuICAgICAgYXdhaXQgdGVtcG9yYWw/LnNodXRkb3duKCk7XG4gICAgfSxcbiAgfTtcbn1cblxucHJvY2Vzcy5vbignYmVmb3JlRXhpdCcsIGFzeW5jICgpID0+IHtcbiAgaWYgKCF0ZW1wb3JhbCkgcmV0dXJuO1xuICBhd2FpdCB0ZW1wb3JhbD8uc2h1dGRvd24oKTtcbn0pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYWxleC50aWRlbWFuL1RlbXBvcmFsL3VpL3V0aWxpdGllc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2FsZXgudGlkZW1hbi9UZW1wb3JhbC91aS91dGlsaXRpZXMvdGVtcG9yYWwtc2VydmVyLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9hbGV4LnRpZGVtYW4vVGVtcG9yYWwvdWkvdXRpbGl0aWVzL3RlbXBvcmFsLXNlcnZlci50c1wiO2ltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHdhaXRGb3JQb3J0IGZyb20gJ3dhaXQtcG9ydCc7XG5pbXBvcnQgeyAkLCBjaGFsayB9IGZyb20gJ3p4JztcblxuZXhwb3J0IHR5cGUgVGVtcG9yYWxTZXJ2ZXIgPSB7XG4gIHNodXRkb3duOiAoKSA9PiBQcm9taXNlPG51bWJlciB8IG51bGw+O1xuICByZWFkeTogKCkgPT4gUHJvbWlzZTxib29sZWFuPjtcbn07XG5cbmNvbnN0IGxvY2FsQ0xJUGF0aCA9IGpvaW4ocHJvY2Vzcy5jd2QoKSwgJ2JpbicsICdjbGknLCAndGVtcG9yYWwnKTtcblxuZXhwb3J0IHR5cGUgVGVtcG9yYWxTZXJ2ZXJPcHRpb25zID0ge1xuICBwb3J0PzogbnVtYmVyO1xuICB1aVBvcnQ/OiBudW1iZXI7XG4gIHBhdGg/OiBzdHJpbmc7XG4gIGxvZ0xldmVsPzogc3RyaW5nO1xuICBjb2RlY0VuZHBvaW50Pzogc3RyaW5nO1xuICBoZWFkbGVzcz86IGJvb2xlYW47XG59O1xuXG5jb25zdCB3YXJuID0gKG1lc3NhZ2U6IFBhcmFtZXRlcnM8dHlwZW9mIGNvbnNvbGUud2Fybj5bMF0pID0+IHtcbiAgY29uc29sZS53YXJuKGAke2NoYWxrLmJnWWVsbG93LmJsYWNrKCdXQVJOJyl9OiAke21lc3NhZ2V9YCk7XG59O1xuXG5jb25zdCBnZXRDTElQYXRoID0gYXN5bmMgKGNsaVBhdGggPSBsb2NhbENMSVBhdGgpOiBQcm9taXNlPHN0cmluZyB8IHZvaWQ+ID0+IHtcbiAgY29uc3Qgc3R5bGl6ZWRQYXRoID0gY2hhbGsueWVsbG93QnJpZ2h0KGNsaVBhdGgpO1xuXG4gIGNvbnNvbGUubG9nKGNoYWxrLnllbGxvdyhgQ2hlY2tpbmcgVGVtcG9yYWwgQ0xJIGF0ICR7c3R5bGl6ZWRQYXRofVx1MjAyNmApKTtcblxuICBjb25zdCB7IHN0ZG91dCwgZXhpdENvZGUgfSA9IGF3YWl0ICRgJHtjbGlQYXRofSAtdmAucXVpZXQoKS5ub3Rocm93KCk7XG5cbiAgaWYgKGV4aXRDb2RlID09PSAwKSB7XG4gICAgY29uc29sZS5sb2coXG4gICAgICBjaGFsay5ncmVlbkJyaWdodChcbiAgICAgICAgYFRlbXBvcmFsIENMSSBmb3VuZCBhdCAke3N0eWxpemVkUGF0aH06XFxuXFx0YCxcbiAgICAgICAgJ1x1MjE5MicsXG4gICAgICAgIGNoYWxrLmdyZWVuKHN0ZG91dC50cmltKCkpLFxuICAgICAgKSxcbiAgICApO1xuXG4gICAgcmV0dXJuIGNsaVBhdGg7XG4gIH1cblxuICBjb25zdCB7IHN0ZG91dDogZ2xvYmFsUGF0aCB9ID0gYXdhaXQgJGB3aGljaCB0ZW1wb3JhbGAubm90aHJvdygpO1xuXG4gIGlmIChnbG9iYWxQYXRoICYmIGNsaVBhdGggIT09IGdsb2JhbFBhdGgudHJpbSgpKVxuICAgIHJldHVybiBnZXRDTElQYXRoKGdsb2JhbFBhdGgudHJpbSgpKTtcblxuICB3YXJuKFwiQ291bGRuJ3QgZmluZCBUZW1wb3JhbCBDTEkuIFNraXBwaW5nXHUyMDI2XCIpO1xufTtcblxubGV0IHRlbXBvcmFsU2VydmVyOiBUZW1wb3JhbFNlcnZlcjtcblxuZXhwb3J0IGNvbnN0IGdldFRlbXBvcmFsU2VydmVyID0gKCk6IFRlbXBvcmFsU2VydmVyID0+IHRlbXBvcmFsU2VydmVyO1xuXG5leHBvcnQgY29uc3QgY3JlYXRlVGVtcG9yYWxTZXJ2ZXIgPSBhc3luYyAoe1xuICBwb3J0ID0gNzIzMyxcbiAgdWlQb3J0ID0gcG9ydCArIDEwMDAsXG4gIHBhdGggPSBsb2NhbENMSVBhdGgsXG4gIGxvZ0xldmVsID0gJ2ZhdGFsJyxcbiAgY29kZWNFbmRwb2ludCxcbiAgaGVhZGxlc3MgPSBmYWxzZSxcbn06IFRlbXBvcmFsU2VydmVyT3B0aW9ucyA9IHt9KSA9PiB7XG4gIGNvbnN0IGNsaVBhdGggPSBhd2FpdCBnZXRDTElQYXRoKHBhdGgpO1xuXG4gIGNvbnN0IGZsYWdzID0gW1xuICAgIGAtLXBvcnQ9JHtwb3J0fWAsXG4gICAgYC0tdWktcG9ydD0ke3VpUG9ydH1gLFxuICAgIGAtLWxvZy1sZXZlbD0ke2xvZ0xldmVsfWAsXG4gIF07XG5cbiAgaWYgKGNvZGVjRW5kcG9pbnQpIHtcbiAgICBmbGFncy5wdXNoKGAtLXVpLWNvZGVjLWVuZHBvaW50PSR7Y29kZWNFbmRwb2ludH1gKTtcbiAgfVxuXG4gIGlmIChoZWFkbGVzcykge1xuICAgIGZsYWdzLnB1c2goJy0taGVhZGxlc3MnKTtcbiAgfVxuXG4gIGNvbnN0IHRlbXBvcmFsID1cbiAgICAkYCR7Y2xpUGF0aH0gc2VydmVyIHN0YXJ0LWRldiAtLWR5bmFtaWMtY29uZmlnLXZhbHVlIGZyb250ZW5kLndvcmtlclZlcnNpb25pbmdEYXRhQVBJcz10cnVlIC0tZHluYW1pYy1jb25maWctdmFsdWUgZnJvbnRlbmQud29ya2VyVmVyc2lvbmluZ1dvcmtmbG93QVBJcz10cnVlIC0tZHluYW1pYy1jb25maWctdmFsdWUgd29ya2VyLmJ1aWxkSWRTY2F2ZW5nZXJFbmFibGVkPXRydWUgJHtmbGFnc31gLnF1aWV0KCk7XG5cbiAgdGVtcG9yYWwuY2F0Y2goYXN5bmMgKHsgc3Rkb3V0LCBzdGRlcnIsIGV4aXRDb2RlIH0pID0+IHtcbiAgICBpZiAoZXhpdENvZGUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHsgZXJyb3IgfTogeyBlcnJvcjogc3RyaW5nIH0gPSBKU09OLnBhcnNlKHN0ZG91dCk7XG5cbiAgICAgICAgaWYgKGVycm9yLmluY2x1ZGVzKCdhZGRyZXNzIGFscmVhZHkgaW4gdXNlJykpIHtcbiAgICAgICAgICByZXR1cm4gd2FybihcbiAgICAgICAgICAgIGBQb3J0ICR7cG9ydH0gaXMgYWxyZWFkeSBpbiB1c2UuIEZhbGxpbmcgYmFjayB0byB3aGF0ZXZlciBpcyBydW5uaW5nIG9uIHRoYXQgcG9ydC5gLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyBuZXcgRXJyb3Ioc3RkZXJyID8/IHN0ZG91dCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3Ioc3RkZXJyID8/IHN0ZG91dCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBjb25zdCBzaHV0ZG93biA9IGFzeW5jICgpID0+IHtcbiAgICBhd2FpdCB0ZW1wb3JhbC5raWxsKCk7XG4gICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQyQSBraWxsZWQgdGVtcG9yYWwgc2VydmVyJyk7XG4gICAgcmV0dXJuIGF3YWl0IHRlbXBvcmFsLmV4aXRDb2RlO1xuICB9O1xuXG4gIGNvbnN0IHJlYWR5ID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHBvcnRzID0gW1xuICAgICAgd2FpdEZvclBvcnQoeyBwb3J0LCBvdXRwdXQ6ICdzaWxlbnQnIH0pLFxuICAgICAgIWhlYWRsZXNzICYmIHdhaXRGb3JQb3J0KHsgcG9ydDogdWlQb3J0LCBvdXRwdXQ6ICdzaWxlbnQnIH0pLFxuICAgIF07XG5cbiAgICBjb25zdCBwb3J0c1Byb21pc2UgPSBhd2FpdCBQcm9taXNlLmFsbChwb3J0cykudGhlbigocG9ydHMpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGBcdTI3MjggdGVtcG9yYWwgZGV2IHNlcnZlciBydW5uaW5nIG9uIHBvcnQ6ICR7cG9ydH1gKTtcblxuICAgICAgcmV0dXJuIHBvcnRzO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHBvcnRzUHJvbWlzZS5ldmVyeSgoeyBvcGVuIH0pID0+IG9wZW4pO1xuICB9O1xuXG4gIHRlbXBvcmFsU2VydmVyID0ge1xuICAgIHJlYWR5LFxuICAgIHNodXRkb3duLFxuICB9O1xuXG4gIHJldHVybiB0ZW1wb3JhbFNlcnZlcjtcbn07XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9hbGV4LnRpZGVtYW4vVGVtcG9yYWwvdWkvdXRpbGl0aWVzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvYWxleC50aWRlbWFuL1RlbXBvcmFsL3VpL3V0aWxpdGllcy91aS1zZXJ2ZXIudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2FsZXgudGlkZW1hbi9UZW1wb3JhbC91aS91dGlsaXRpZXMvdWktc2VydmVyLnRzXCI7aW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQgd2FpdEZvclBvcnQgZnJvbSAnd2FpdC1wb3J0JztcbmltcG9ydCB7ICQgfSBmcm9tICd6eCc7XG5cbmV4cG9ydCB0eXBlIFVJU2VydmVyID0ge1xuICBzaHV0ZG93bjogKCkgPT4gUHJvbWlzZTxudW1iZXIgfCBudWxsPjtcbiAgcmVhZHk6ICgpID0+IFJldHVyblR5cGU8dHlwZW9mIHdhaXRGb3JQb3J0Pjtcbn07XG5cbmxldCB1aVNlcnZlcjogVUlTZXJ2ZXI7XG5cbmV4cG9ydCBjb25zdCBnZXRVSVNlcnZlciA9ICgpOiBVSVNlcnZlciA9PiB7XG4gIHJldHVybiB1aVNlcnZlcjtcbn07XG5cbnR5cGUgRW52aXJvbmVtdCA9ICdkZXZlbG9wbWVudCcgfCAnZTJlJztcblxuY29uc3QgcG9ydEZvckVudiA9IChlbnY6IEVudmlyb25lbXQpID0+IHtcbiAgaWYgKGVudiA9PT0gJ2RldmVsb3BtZW50JykgcmV0dXJuIDgwODE7XG4gIGlmIChlbnYgPT09ICdlMmUnKSByZXR1cm4gODA4MDtcbn07XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVVSVNlcnZlciA9IGFzeW5jIChcbiAgZW52OiAnZGV2ZWxvcG1lbnQnIHwgJ2UyZScgPSAnZGV2ZWxvcG1lbnQnLFxuKSA9PiB7XG4gICQuY3dkID0gam9pbihwcm9jZXNzLmN3ZCgpLCAnc2VydmVyJyk7XG5cbiAgYXdhaXQgJGBtYWtlIGJ1aWxkLXNlcnZlcmA7XG5cbiAgY29uc3QgdWlTZXJ2ZXJQcm9jZXNzID0gJGAuL3VpLXNlcnZlciAtLWVudiAke2Vudn0gc3RhcnRgLnF1aWV0KCk7XG4gIGNvbnNvbGUubG9nKGBcdTI3MjggdWktc2VydmVyIHJ1bm5pbmcgaW4gJHtlbnZ9IG1vZGUgb24gcG9ydCAke3BvcnRGb3JFbnYoZW52KX1gKTtcblxuICBjb25zdCBzaHV0ZG93biA9IGFzeW5jICgpID0+IHtcbiAgICBhd2FpdCB1aVNlcnZlclByb2Nlc3Mua2lsbCgpO1xuICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMkEga2lsbGVkIHVpLXNlcnZlcicpO1xuICAgIHJldHVybiBhd2FpdCB1aVNlcnZlclByb2Nlc3MuZXhpdENvZGU7XG4gIH07XG5cbiAgY29uc3QgcmVhZHkgPSBhc3luYyAoKSA9PiB7XG4gICAgcmV0dXJuIHdhaXRGb3JQb3J0KHsgcG9ydDogcG9ydEZvckVudihlbnYpLCBvdXRwdXQ6ICdzaWxlbnQnIH0pO1xuICB9O1xuXG4gIHVpU2VydmVyID0ge1xuICAgIHNodXRkb3duLFxuICAgIHJlYWR5LFxuICB9O1xuXG4gIHJldHVybiB1aVNlcnZlcjtcbn07XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9hbGV4LnRpZGVtYW4vVGVtcG9yYWwvdWkvcGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2FsZXgudGlkZW1hbi9UZW1wb3JhbC91aS9wbHVnaW5zL3ZpdGUtcGx1Z2luLXVpLXNlcnZlci50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvYWxleC50aWRlbWFuL1RlbXBvcmFsL3VpL3BsdWdpbnMvdml0ZS1wbHVnaW4tdWktc2VydmVyLnRzXCI7aW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB0eXBlIHsgVml0ZURldlNlcnZlciB9IGZyb20gJ3ZpdGUnO1xuXG5pbXBvcnQgeyBjcmVhdGVVSVNlcnZlciwgVUlTZXJ2ZXIgfSBmcm9tICcuLi91dGlsaXRpZXMvdWktc2VydmVyJztcblxubGV0IHVpU2VydmVyOiBVSVNlcnZlcjtcblxuY29uc3Qgc2hvdWxkU2tpcCA9IChzZXJ2ZXI6IFZpdGVEZXZTZXJ2ZXIpOiBib29sZWFuID0+IHtcbiAgaWYgKHByb2Nlc3MuZW52LlZFUkNFTCkgcmV0dXJuIHRydWU7XG4gIGlmIChwcm9jZXNzLmVudi5ISVNUT0lSRSkgcmV0dXJuIHRydWU7XG4gIGlmIChwcm9jZXNzLmVudi5WSVRFU1QpIHJldHVybiB0cnVlO1xuICBpZiAocHJvY2Vzcy5lbnYuQ0kpIHJldHVybiB0cnVlO1xuICBpZiAoXG4gICAgc2VydmVyLmNvbmZpZy5tb2RlID09PSAnZG9ja2VyJyB8fFxuICAgIHNlcnZlci5jb25maWcubW9kZSA9PT0gJ3RlbXBvcmFsLXNlcnZlcicgfHxcbiAgICBzZXJ2ZXIuY29uZmlnLm1vZGUuaW5jbHVkZXMoJ3Rlc3QnKVxuICApXG4gICAgcmV0dXJuIHRydWU7XG5cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHVpU2VydmVyUGx1Z2luKCk6IFBsdWdpbiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3ZpdGUtcGx1Z2luLXVpLXNlcnZlcicsXG4gICAgZW5mb3JjZTogJ3Bvc3QnLFxuICAgIGFwcGx5OiAnc2VydmUnLFxuICAgIGFzeW5jIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgIGlmIChzaG91bGRTa2lwKHNlcnZlcikpIHJldHVybjtcbiAgICAgIHVpU2VydmVyID0gYXdhaXQgY3JlYXRlVUlTZXJ2ZXIoKTtcbiAgICAgIGF3YWl0IHVpU2VydmVyLnJlYWR5KCk7XG4gICAgfSxcbiAgICBhc3luYyBjbG9zZUJ1bmRsZSgpIHtcbiAgICAgIGF3YWl0IHVpU2VydmVyPy5zaHV0ZG93bigpO1xuICAgIH0sXG4gIH07XG59XG5cbnByb2Nlc3Mub24oJ2JlZm9yZUV4aXQnLCBhc3luYyAoKSA9PiB7XG4gIGlmICghdWlTZXJ2ZXIpIHJldHVybjtcbiAgYXdhaXQgdWlTZXJ2ZXI/LnNodXRkb3duKCk7XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBK1EsT0FBTyxVQUFVO0FBRWhTLFNBQVMsaUJBQWlCO0FBQzFCLFNBQVMsb0JBQW9COzs7QUNEN0IsU0FBUyxTQUFBQSxjQUFhOzs7QUNGK1IsU0FBUyxZQUFZO0FBRTFVLE9BQU8saUJBQWlCO0FBQ3hCLFNBQVMsR0FBRyxhQUFhO0FBT3pCLElBQU0sZUFBZSxLQUFLLFFBQVEsSUFBSSxHQUFHLE9BQU8sT0FBTyxVQUFVO0FBV2pFLElBQU0sT0FBTyxDQUFDLFlBQWdEO0FBQzVELFVBQVEsS0FBSyxHQUFHLE1BQU0sU0FBUyxNQUFNLE1BQU0sTUFBTSxTQUFTO0FBQzVEO0FBRUEsSUFBTSxhQUFhLE9BQU8sVUFBVSxpQkFBeUM7QUFDM0UsUUFBTSxlQUFlLE1BQU0sYUFBYSxPQUFPO0FBRS9DLFVBQVEsSUFBSSxNQUFNLE9BQU8sNEJBQTRCLG9CQUFlLENBQUM7QUFFckUsUUFBTSxFQUFFLFFBQVEsU0FBUyxJQUFJLE1BQU0sSUFBSSxhQUFhLE1BQU0sRUFBRSxRQUFRO0FBRXBFLE1BQUksYUFBYSxHQUFHO0FBQ2xCLFlBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxRQUNKLHlCQUF5QjtBQUFBO0FBQUEsUUFDekI7QUFBQSxRQUNBLE1BQU0sTUFBTSxPQUFPLEtBQUssQ0FBQztBQUFBLE1BQzNCO0FBQUEsSUFDRjtBQUVBLFdBQU87QUFBQSxFQUNUO0FBRUEsUUFBTSxFQUFFLFFBQVEsV0FBVyxJQUFJLE1BQU0sa0JBQWtCLFFBQVE7QUFFL0QsTUFBSSxjQUFjLFlBQVksV0FBVyxLQUFLO0FBQzVDLFdBQU8sV0FBVyxXQUFXLEtBQUssQ0FBQztBQUVyQyxPQUFLLDRDQUF1QztBQUM5QztBQUVBLElBQUk7QUFJRyxJQUFNLHVCQUF1QixPQUFPO0FBQUEsRUFDekMsT0FBTztBQUFBLEVBQ1AsU0FBUyxPQUFPO0FBQUEsRUFDaEIsTUFBQUMsUUFBTztBQUFBLEVBQ1AsV0FBVztBQUFBLEVBQ1g7QUFBQSxFQUNBLFdBQVc7QUFDYixJQUEyQixDQUFDLE1BQU07QUFDaEMsUUFBTSxVQUFVLE1BQU0sV0FBV0EsS0FBSTtBQUVyQyxRQUFNLFFBQVE7QUFBQSxJQUNaLFVBQVU7QUFBQSxJQUNWLGFBQWE7QUFBQSxJQUNiLGVBQWU7QUFBQSxFQUNqQjtBQUVBLE1BQUksZUFBZTtBQUNqQixVQUFNLEtBQUssdUJBQXVCLGVBQWU7QUFBQSxFQUNuRDtBQUVBLE1BQUksVUFBVTtBQUNaLFVBQU0sS0FBSyxZQUFZO0FBQUEsRUFDekI7QUFFQSxRQUFNQyxZQUNKLElBQUksdU5BQXVOLFFBQVEsTUFBTTtBQUUzTyxFQUFBQSxVQUFTLE1BQU0sT0FBTyxFQUFFLFFBQVEsUUFBUSxTQUFTLE1BQU07QUFDckQsUUFBSSxVQUFVO0FBQ1osVUFBSTtBQUNGLGNBQU0sRUFBRSxNQUFNLElBQXVCLEtBQUssTUFBTSxNQUFNO0FBRXRELFlBQUksTUFBTSxTQUFTLHdCQUF3QixHQUFHO0FBQzVDLGlCQUFPO0FBQUEsWUFDTCxRQUFRO0FBQUEsVUFDVjtBQUFBLFFBQ0Y7QUFFQSxjQUFNLElBQUksTUFBTSxVQUFVLE1BQU07QUFBQSxNQUNsQyxTQUFTLE9BQVA7QUFDQSxjQUFNLElBQUksTUFBTSxVQUFVLE1BQU07QUFBQSxNQUNsQztBQUFBLElBQ0Y7QUFBQSxFQUNGLENBQUM7QUFFRCxRQUFNLFdBQVcsWUFBWTtBQUMzQixVQUFNQSxVQUFTLEtBQUs7QUFDcEIsWUFBUSxJQUFJLGtDQUEyQjtBQUN2QyxXQUFPLE1BQU1BLFVBQVM7QUFBQSxFQUN4QjtBQUVBLFFBQU0sUUFBUSxZQUFZO0FBQ3hCLFVBQU0sUUFBUTtBQUFBLE1BQ1osWUFBWSxFQUFFLE1BQU0sUUFBUSxTQUFTLENBQUM7QUFBQSxNQUN0QyxDQUFDLFlBQVksWUFBWSxFQUFFLE1BQU0sUUFBUSxRQUFRLFNBQVMsQ0FBQztBQUFBLElBQzdEO0FBRUEsVUFBTSxlQUFlLE1BQU0sUUFBUSxJQUFJLEtBQUssRUFBRSxLQUFLLENBQUNDLFdBQVU7QUFDNUQsY0FBUSxJQUFJLCtDQUEwQyxNQUFNO0FBRTVELGFBQU9BO0FBQUEsSUFDVCxDQUFDO0FBRUQsV0FBTyxhQUFhLE1BQU0sQ0FBQyxFQUFFLEtBQUssTUFBTSxJQUFJO0FBQUEsRUFDOUM7QUFFQSxtQkFBaUI7QUFBQSxJQUNmO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFFQSxTQUFPO0FBQ1Q7OztBRHZIQSxJQUFNLEVBQUUsTUFBTSxRQUFRLElBQUlDO0FBRTFCLElBQUk7QUFFSixJQUFNLGFBQWEsQ0FBQyxXQUFtQztBQUNyRCxNQUFJLFFBQVEsSUFBSTtBQUFRLFdBQU87QUFDL0IsTUFBSSxRQUFRLElBQUk7QUFBVSxXQUFPO0FBQ2pDLE1BQUksUUFBUSxJQUFJO0FBQVEsV0FBTztBQUMvQixNQUFJO0FBQVUsV0FBTztBQUNyQixNQUFJLFFBQVEsYUFBYTtBQUFTLFdBQU87QUFDekMsTUFBSSxPQUFPLE9BQU8sU0FBUyxZQUFZLE9BQU8sT0FBTyxLQUFLLFNBQVMsTUFBTTtBQUN2RSxXQUFPO0FBRVQsU0FBTztBQUNUO0FBRUEsSUFBTSx5QkFBeUIsQ0FBQyxVQUFrQixXQUFXLFNBQWlCO0FBQzVFLFNBQU87QUFBQSxJQUNMLFNBQVMsTUFBTSxTQUFTLFlBQVksR0FBRyxJQUFJLEdBQUcsU0FBUyxNQUFNO0FBQUEsSUFDN0Q7QUFBQSxFQUNGO0FBQ0Y7QUFFQSxJQUFNLGNBQWMsQ0FBQyxTQUEwQjtBQUM3QyxNQUFJLE9BQU8sU0FBUztBQUFVLFdBQU87QUFDckMsTUFBSSxNQUFNLElBQUk7QUFBRyxXQUFPO0FBQ3hCLE1BQUksUUFBUTtBQUFNLFdBQU87QUFDekIsTUFBSSxPQUFPO0FBQU8sV0FBTztBQUN6QixTQUFPO0FBQ1Q7QUFFQSxJQUFNLGVBQWUsQ0FBQyxNQUF1QixhQUE2QjtBQUN4RSxTQUFPLE9BQU8sSUFBSTtBQUVsQixNQUFJLFlBQVksSUFBSTtBQUFHLFdBQU87QUFFOUIsVUFBUSxNQUFNLEdBQUcsNkNBQTZDLFdBQVc7QUFFekUsTUFBSSxZQUFZLFFBQVE7QUFBRyxXQUFPO0FBRWxDLFFBQU0sSUFBSTtBQUFBLElBQ1IsMkJBQTJCLDJCQUEyQjtBQUFBLEVBQ3hEO0FBQ0Y7QUFFTyxTQUFTQyxrQkFBeUI7QUFDdkMsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsT0FBTztBQUFBLElBQ1AsTUFBTSxnQkFBZ0IsUUFBUTtBQUM1QixVQUFJLFdBQVcsTUFBTTtBQUFHO0FBRXhCLFlBQU0sT0FBTyxhQUFhLE9BQU8sT0FBTyxJQUFJLG9CQUFvQixJQUFJO0FBQ3BFLFlBQU0sU0FBUyx1QkFBdUIsT0FBTyxPQUFPLElBQUksUUFBUTtBQUVoRSxjQUFRLElBQUksUUFBUSxvQ0FBb0MsWUFBTyxDQUFDO0FBQ2hFLGNBQVEsSUFBSSxLQUFLLHVDQUF1QyxjQUFTLENBQUM7QUFFbEUsaUJBQVcsTUFBTSxxQkFBcUI7QUFBQSxRQUNwQztBQUFBLFFBQ0E7QUFBQSxNQUNGLENBQUM7QUFFRCxZQUFNLFNBQVMsTUFBTTtBQUVyQixjQUFRLElBQUksUUFBUSxzQ0FBc0MsT0FBTyxDQUFDO0FBQ2xFLGNBQVEsSUFBSSxLQUFLLHlDQUF5QyxTQUFTLENBQUM7QUFBQSxJQUN0RTtBQUFBLElBQ0EsTUFBTSxjQUFjO0FBQ2xCLGFBQU0scUNBQVU7QUFBQSxJQUNsQjtBQUFBLEVBQ0Y7QUFDRjtBQUVBLFFBQVEsR0FBRyxjQUFjLFlBQVk7QUFDbkMsTUFBSSxDQUFDO0FBQVU7QUFDZixTQUFNLHFDQUFVO0FBQ2xCLENBQUM7OztBRXZGd1MsU0FBUyxRQUFBQyxhQUFZO0FBRTlULE9BQU9DLGtCQUFpQjtBQUN4QixTQUFTLEtBQUFDLFVBQVM7QUFPbEIsSUFBSTtBQVFKLElBQU0sYUFBYSxDQUFDLFFBQW9CO0FBQ3RDLE1BQUksUUFBUTtBQUFlLFdBQU87QUFDbEMsTUFBSSxRQUFRO0FBQU8sV0FBTztBQUM1QjtBQUVPLElBQU0saUJBQWlCLE9BQzVCLE1BQTZCLGtCQUMxQjtBQUNILEVBQUFDLEdBQUUsTUFBTUMsTUFBSyxRQUFRLElBQUksR0FBRyxRQUFRO0FBRXBDLFFBQU1EO0FBRU4sUUFBTSxrQkFBa0JBLHVCQUFzQixZQUFZLE1BQU07QUFDaEUsVUFBUSxJQUFJLCtCQUEwQixvQkFBb0IsV0FBVyxHQUFHLEdBQUc7QUFFM0UsUUFBTSxXQUFXLFlBQVk7QUFDM0IsVUFBTSxnQkFBZ0IsS0FBSztBQUMzQixZQUFRLElBQUksNEJBQXFCO0FBQ2pDLFdBQU8sTUFBTSxnQkFBZ0I7QUFBQSxFQUMvQjtBQUVBLFFBQU0sUUFBUSxZQUFZO0FBQ3hCLFdBQU9FLGFBQVksRUFBRSxNQUFNLFdBQVcsR0FBRyxHQUFHLFFBQVEsU0FBUyxDQUFDO0FBQUEsRUFDaEU7QUFFQSxhQUFXO0FBQUEsSUFDVDtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBRUEsU0FBTztBQUNUOzs7QUM1Q0EsSUFBSUM7QUFFSixJQUFNQyxjQUFhLENBQUMsV0FBbUM7QUFDckQsTUFBSSxRQUFRLElBQUk7QUFBUSxXQUFPO0FBQy9CLE1BQUksUUFBUSxJQUFJO0FBQVUsV0FBTztBQUNqQyxNQUFJLFFBQVEsSUFBSTtBQUFRLFdBQU87QUFDL0IsTUFBSSxRQUFRLElBQUk7QUFBSSxXQUFPO0FBQzNCLE1BQ0UsT0FBTyxPQUFPLFNBQVMsWUFDdkIsT0FBTyxPQUFPLFNBQVMscUJBQ3ZCLE9BQU8sT0FBTyxLQUFLLFNBQVMsTUFBTTtBQUVsQyxXQUFPO0FBRVQsU0FBTztBQUNUO0FBRU8sU0FBUyxpQkFBeUI7QUFDdkMsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsT0FBTztBQUFBLElBQ1AsTUFBTSxnQkFBZ0IsUUFBUTtBQUM1QixVQUFJQSxZQUFXLE1BQU07QUFBRztBQUN4QixNQUFBRCxZQUFXLE1BQU0sZUFBZTtBQUNoQyxZQUFNQSxVQUFTLE1BQU07QUFBQSxJQUN2QjtBQUFBLElBQ0EsTUFBTSxjQUFjO0FBQ2xCLGFBQU1BLGFBQUEsZ0JBQUFBLFVBQVU7QUFBQSxJQUNsQjtBQUFBLEVBQ0Y7QUFDRjtBQUVBLFFBQVEsR0FBRyxjQUFjLFlBQVk7QUFDbkMsTUFBSSxDQUFDQTtBQUFVO0FBQ2YsU0FBTUEsYUFBQSxnQkFBQUEsVUFBVTtBQUNsQixDQUFDOzs7QUpqQ0QsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLFVBQVUsR0FBR0UsZ0JBQWUsR0FBRyxlQUFlLENBQUM7QUFBQSxFQUN6RCxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsWUFBWSxlQUFlLHVCQUF1QjtBQUFBLEVBQzlEO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxRQUFRLEtBQUssUUFBUSxhQUFhO0FBQUEsTUFDbEMsV0FBVyxLQUFLLFFBQVEsZ0JBQWdCO0FBQUEsTUFDeEMsYUFBYSxLQUFLLFFBQVEsdUJBQXVCO0FBQUEsSUFDbkQ7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLEVBQ1I7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogWyJjaGFsayIsICJwYXRoIiwgInRlbXBvcmFsIiwgInBvcnRzIiwgImNoYWxrIiwgInRlbXBvcmFsU2VydmVyIiwgImpvaW4iLCAid2FpdEZvclBvcnQiLCAiJCIsICIkIiwgImpvaW4iLCAid2FpdEZvclBvcnQiLCAidWlTZXJ2ZXIiLCAic2hvdWxkU2tpcCIsICJ0ZW1wb3JhbFNlcnZlciJdCn0K
