const glob = require("fast-glob");
const { yarnInstall, prettierFormat } = require("../utils");
const packages = require("./packages");

module.exports = async context => {
    const packageFiles = await packages.getFiles();

    const files = await glob([
        // add files here
        ...packageFiles
    ]);

    /**
     * Upgrade the dom from tsconfig.
     */
    await packages.removeLibDom(context);

    /**
     * Format updated files.
     */
    await prettierFormat(files, context);

    /**
     * Install new packages.
     */
    await yarnInstall({
        context
    });
};
