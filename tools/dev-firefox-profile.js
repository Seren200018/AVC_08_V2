import http from "node:http";
import {spawn} from "node:child_process";
import {resolve} from "node:path";

const toNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const mode = process.env.VITE_MODE || "debug";
const port = toNumber(process.env.VITE_PORT, 5173);
const openPath = process.env.VITE_OPEN_PATH || "/main.html";
const waitMs = toNumber(process.env.VITE_WAIT_MS, 15000);
const url = `http://localhost:${port}${openPath}`;

const viteBin = resolve(
    process.cwd(),
    "node_modules",
    ".bin",
    process.platform === "win32" ? "vite.cmd" : "vite"
);

const vite = spawn(viteBin, ["--mode", mode, "--port", String(port)], {
    stdio: "inherit",
});

const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

const probeServer = () =>
    new Promise((resolvePromise) => {
        const request = http.get(url, (response) => {
            response.resume();
            resolvePromise(true);
        });
        request.on("error", () => resolvePromise(false));
        request.setTimeout(1000, () => {
            request.destroy();
            resolvePromise(false);
        });
    });

const waitForServer = async () => {
    const deadline = Date.now() + waitMs;
    while (Date.now() < deadline) {
        if (await probeServer()) {
            return true;
        }
        await sleep(200);
    }
    return false;
};

const launchFirefox = () => {
    const firefoxBin = process.env.FIREFOX_BIN || "firefox";
    const args = [];
    if (process.env.FIREFOX_NO_REMOTE === "1") {
        args.push("-no-remote");
    } else if (process.env.FIREFOX_NEW_INSTANCE === "1") {
        args.push("-new-instance");
    }
    if (process.env.FIREFOX_PROFILE) {
        args.push("-profile", process.env.FIREFOX_PROFILE);
    }
    args.push("-new-window", url);

    const env = {
        ...process.env,
        MOZ_PROFILER_STARTUP: process.env.MOZ_PROFILER_STARTUP || "1",
        MOZ_PROFILER_STARTUP_ENTRIES:
            process.env.MOZ_PROFILER_STARTUP_ENTRIES || "10000000",
        MOZ_PROFILER_STARTUP_INTERVAL:
            process.env.MOZ_PROFILER_STARTUP_INTERVAL || "1",
    };

    if (process.env.MOZ_PROFILER_STARTUP_FILTERS) {
        env.MOZ_PROFILER_STARTUP_FILTERS = process.env.MOZ_PROFILER_STARTUP_FILTERS;
    }

    return spawn(firefoxBin, args, {env, stdio: "inherit"});
};

const main = async () => {
    const ready = await waitForServer();
    if (!ready) {
        console.warn(
            `[dev:debug] Vite server did not respond within ${waitMs}ms; launching Firefox anyway.`
        );
    }

    const firefox = launchFirefox();

    const shutdown = (signal) => {
        if (firefox && !firefox.killed) {
            firefox.kill(signal);
        }
        if (vite && !vite.killed) {
            vite.kill(signal);
        }
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
};

main().catch((error) => {
    console.error("[dev:debug] Failed to start profiling session.", error);
    process.exitCode = 1;
});
