const glob = require("fast-glob");
const { yarnInstall, createMorphProject, prettierFormat } = require("../utils");
const apiPulumi = require("./apiPulumi");

module.exports = async context => {
    const apiPulumiFiles = await apiPulumi.getFiles(context);

    const files = await glob([
        // add files here
        ...apiPulumiFiles
    ]);

    //const project = createMorphProject(files);
    /**
     * Upgrade API Pulumi files.
     */
    await apiPulumi.upgradeProject(context, {
        files
    });

    //await project.save();

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
