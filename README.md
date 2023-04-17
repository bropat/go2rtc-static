# go2rtc-static

**[go2rtc](https://github.com/AlexxIT/go2rtc) static binaries for Mac OSX, Linux and Windows.**

[![node](https://img.shields.io/node/v/go2rtc-static.svg)](https://www.npmjs.com/package/go2rtc-static)
[![NPM version](http://img.shields.io/npm/v/go2rtc-static.svg)](https://www.npmjs.com/package/go2rtc-static)
[![Downloads](https://img.shields.io/npm/dm/go2rtc-static.svg)](https://www.npmjs.com/package/go2rtc-static)
[![Total Downloads](https://img.shields.io/npm/dt/go2rtc-static.svg)](https://www.npmjs.com/package/go2rtc-static)

[![NPM](https://nodei.co/npm/go2rtc-static.png?downloads=true)](https://nodei.co/npm/go2rtc-static/)

## Installation

This module is installed via npm:

```bash
$ npm install go2rtc-static
```

*Note:* During installation, it will download the appropriate `go2rtc` binary from the [GitHub release](https://github.com/bropat/go2rtc-static/releases/latest). Use and distribution of the binary releases of go2rtc are covered by their respective license.

## Example Usage

Returns the path of a statically linked go2rtc binary on the local filesystem.

```js
var pathToGo2rtc = require("go2rtc-static");
console.log(pathToGo2rtc);
```

```typescript
import pathToGo2rtc from "go2rtc-static";
console.log(pathToGo2rtc);
```

## Sources of the binaries

[The build script](build/build.sh) downloads binaries from [go2rtc GitHub releases](https://github.com/AlexxIT/go2rtc/releases).
