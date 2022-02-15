const glob = require("fast-glob");
const { yarnInstall, createMorphProject, prettierFormat } = require("../utils");
const apiPulumi = require("./apiPulumi");

module.exports = async context => {
    const apiPulumiFiles = await apiPulumi.getFiles(context);

    const files = await glob([
        // add files here
        ...apiPulumiFiles
    ]);

    /**
     * Upgrade API Pulumi files.
     */
    await apiPulumi.upgradeProject(context, {
        files
    });

    /**
     * Install new packages.
     */
    await yarnInstall({
        context
    });
};
