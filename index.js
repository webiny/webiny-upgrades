#!/usr/bin/env node
process.env.NODE_PATH = process.cwd();
require("ts-node").register({
    dir: __dirname
});

(async () => {
    const { run } = require("./run");

    await run();
})();
