import * as os from "os";
import * as fs from "fs";
import { pipeline } from "stream/promises";
import type { Got, HTTPError, Progress } from "got" with {
    "resolution-mode": "import"
};

import { createGunzip } from "zlib";
import { default as ProgressBar } from "progress";
import { HttpsProxyAgent } from "https-proxy-agent";
import { extname } from "path";

var go2rtcPath = require(".");
var pkg = require("../package.json");
const {
    "binary-release-tag-env-var": RELEASE_ENV_VAR,
    "binaries-url-env-var": BINARIES_URL_ENV_VAR,
    "executable-base-name": executableBaseName,
} = pkg[pkg.name];

const exitOnError = (err: string) => {
    console.error(`\n${err}`);
    process.exit(1);
}
const exitOnErrorOrWarnWith = (msg: string) => (err: any) => {
    if (err.statusCode === 404)
        console.warn(msg);
    else
        exitOnError(err);
}

if (!go2rtcPath) {
    exitOnError("go2rtc-static install failed: No binary found for architecture")
}

try {
    const stats = fs.statSync(go2rtcPath);
    if (stats.isFile() && stats.size > 0) {
        console.info("go2rtc is installed already.");
        process.exit(0);
    } else if (stats.size === 0) {
        fs.rmSync(go2rtcPath);
    }
} catch (err: any) {
    if (err && err.code !== "ENOENT")
        exitOnError(err);
}

let agent: HttpsProxyAgent<string>|undefined;
const proxyUrl = (
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy
);
if (proxyUrl) {
    agent = new HttpsProxyAgent(new URL(proxyUrl));
}

function isGzUrl(url: string): boolean {
    const path = new URL(url).pathname.split("/");
    const filename = path[path.length - 1];
    return filename !== undefined && extname(filename) === ".gz";
}

async function downloadFile(url: string, destinationPath: string): Promise<void> {
    let progressBar: ProgressBar|null = null;

    try {
        const { default: got } = await import("got");
        const stream = await got.stream(url, {
            agent: {
                https: agent
            },
            method: "GET",
            isStream: true,
            followRedirect: true,
            maxRedirects: 3,
            timeout:  {
                request: 30 * 1000, // 30s
            },
            retry: {
                limit: 3
            },
            responseType: "buffer"
        });

        stream.on("downloadProgress", (progress: Progress) => {
            if (process.env.CI) return;
            if (!progress.total) return;
            if (!progressBar) {
                progressBar = new ProgressBar(`Downloading go2rtc ${release} [:bar] :percent :etas `, {
                    complete: "|",
                    incomplete: " ",
                    width: 20,
                    total: progress.total
                });
            }
            progressBar.tick(progress.transferred);
        });
        const streams = isGzUrl(url) ? [stream, createGunzip(), fs.createWriteStream(destinationPath)] : [stream, fs.createWriteStream(destinationPath)];
        await pipeline(streams);
    } catch (error) {
        if (error instanceof (await import("got")).HTTPError) {
            throw new Error(`${error.name}: ${error.message} - url: ${error.request.requestUrl}`);
        }
        throw error;
    }
}

const release = (
    process.env[RELEASE_ENV_VAR] ||
    pkg["go2rtc-static"]["binary-release-tag"]
);
const arch = process.env.npm_config_arch || os.arch();
const platform = process.env.npm_config_platform || os.platform();
const downloadsUrl = (
	process.env[BINARIES_URL_ENV_VAR] ||
    "https://github.com/bropat/go2rtc-static/releases/download"
);
const baseUrl = `${downloadsUrl}/${release}`;
const filename = `${executableBaseName}_${platform === "darwin" ? "mac" : platform === "win32" ? "win" : platform}_${arch === "ia32" ? "i386" : arch === "x64" ? "amd64" : arch}`;
const downloadUrl = `${baseUrl}/${filename}${platform === "win32" ? ".exe" : ""}.gz`;
const licenseUrl = `${baseUrl}/${filename}.LICENSE`;

downloadFile(downloadUrl, go2rtcPath)
.then(() => {
    fs.chmodSync(go2rtcPath, 0o755) // make executable
})
.catch(exitOnError)
.then(() => downloadFile(licenseUrl, `${go2rtcPath}.LICENSE`))
.catch(exitOnErrorOrWarnWith("Failed to download the go2rtc LICENSE."));