/**
 * This upgrade uses ts-node, but it's local only to this upgrade.
 */
process.env.NODE_PATH = process.cwd();
require("ts-node").register({
    dir: __dirname
});

const { upgradeProject } = require("./upgradeProject");

module.exports = async context => {
    await upgradeProject(context);
};
