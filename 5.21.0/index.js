const { yarnInstall, removePulumiCache } = require("../utils");

const apiPageBuilder = require("./apiPageBuilder");
const glob = require("fast-glob");

module.exports = async context => {
    const pageBuilderFiles = apiPageBuilder.getFiles(context);

    const files = await glob([
        // add files here
        ...Object.values(pageBuilderFiles)
        //
    ]);

    /**
     * Install new packages.
     */
    await yarnInstall({
        context
    });
};
