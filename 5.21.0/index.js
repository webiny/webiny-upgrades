const glob = require("fast-glob");
const { yarnInstall, createMorphProject, prettierFormat } = require("../utils");
const apiPageBuilder = require("./apiPageBuilder");
const appsAdmin = require("./appsAdmin");

module.exports = async context => {
    const pageBuilderFiles = apiPageBuilder.getFiles(context);
    const adminAppFiles = appsAdmin.getFiles(context);

    const files = await glob([
        // add files here
        ...Object.values(pageBuilderFiles),
        ...Object.values(adminAppFiles)
    ]);

    const project = createMorphProject(files);
    /**
     * Upgrade the Page Builder related files.
     */
    apiPageBuilder.upgradeProject(context, project);

    await project.save();

    /**
     * Upgrade Admin app related files.
     */
    await appsAdmin.upgradeProject(context, project);

    await project.save();

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
