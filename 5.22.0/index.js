const glob = require("fast-glob");
const { yarnInstall, createMorphProject, prettierFormat } = require("../utils");
const apiGraphQL = require("./apiGraphQL");
const apiHeadlessCms = require("./apiHeadlessCms");
const appHeadlessCms = require("./appHeadlessCms");
const apiPulumiVpc = require("./apiPulumiVpc");

module.exports = async context => {
    const apiGraphQLFiles = apiGraphQL.getFiles(context);
    const apiHeadlessCmsFiles = apiHeadlessCms.getFiles(context);
    const appHeadlessCmsFiles = appHeadlessCms.getFiles(context);

    const files = await glob([
        // add files here
        ...Object.values(apiGraphQLFiles),
        ...Object.values(apiHeadlessCmsFiles),
        ...Object.values(appHeadlessCmsFiles)
    ]);

    const project = createMorphProject(files);
    /**
     * Upgrade API GraphQL.
     */
    apiGraphQL.upgradeProject(context, project);

    /**
     * Upgrade API Headless CMS.
     */
    await apiHeadlessCms.upgradeProject(context, project);

    /**
     * Upgrade APP Headless CMS.
     */
    await appHeadlessCms.upgradeProject(context, project);

    /**
     * Upgrade Pulumi files in the user project.
     */
    await apiPulumiVpc.upgradeApiPulumi(context);

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
