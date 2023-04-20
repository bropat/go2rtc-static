import * as os from "os";
import * as path from "path";

let internalGo2rtcPath: string|null = null;

if (process.env.GO2RTC_BIN) {

    internalGo2rtcPath = process.env.GO2RTC_BIN;
    
} else {

    const pkg = require("../package.json");
    const {
        "executable-base-name": executableBaseName,
    } = pkg[pkg.name];
    if ("string" !== typeof executableBaseName) {
        throw new Error(`package.json: invalid/missing ${pkg.name}.executable-base-name entry`);
    }
  
    var binaries: {
        [index: string]: string[]
    } = {
        darwin: ["x64", "arm64"],
        linux: ["x64", "ia32", "arm64", "arm", "mipsel"],
        win32: ["x64", "ia32", "arm64"]
    };
  
    var platform = process.env.npm_config_platform || os.platform();
    var arch = process.env.npm_config_arch || os.arch();
    internalGo2rtcPath = path.join(__dirname, executableBaseName + (platform === "win32" ? ".exe" : ""));
  
    if (!binaries[platform] || binaries[platform].indexOf(arch) === -1) {
        internalGo2rtcPath= null;
    }
    
}

export const go2rtcPath: string|null = internalGo2rtcPath;
export default go2rtcPath;
module.exports = go2rtcPath;