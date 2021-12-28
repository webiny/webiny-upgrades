const { yarnInstall, createMorphProject } = require("../utils");

const apiPageBuilder = require("./apiPageBuilder");
const glob = require("fast-glob");

module.exports = async context => {
    const pageBuilderFiles = apiPageBuilder.getFiles(context);

    const files = await glob([
        // add files here
        ...Object.values(pageBuilderFiles)
        //
    ]);
    const project = createMorphProject(files);
    /**
     * Upgrade the Page Builder related files.
     */
    apiPageBuilder.upgradeProject(context, project, files);
    /**
     * Install new packages.
     */
    await yarnInstall({
        context
    });
};
