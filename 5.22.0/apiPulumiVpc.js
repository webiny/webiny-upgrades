const path = require("path");
const fs = require("fs");
const { log, getIsElasticsearchProject } = require("../utils");

const pulumiProdVpcProjectFile = "api/pulumi/prod/vpc.ts";
const pulumiProdVpcNodeModulesFile =
    "node_modules/@webiny/cwp-template-aws/template/ddb/api/pulumi/prod/vpc.ts";

const upgradeApiPulumi = context => {
    if (!context.project || !context.project.root) {
        log.error(
            "Missing context.project or context.project.root to upgrade the Pulumi vpc.ts file."
        );
        return;
    }

    /**
     * Not required to upgrade if user's project is with Elasticsearch.
     */
    const isElasticsearchProject = getIsElasticsearchProject(context);
    if (isElasticsearchProject) {
        return;
    }

    log.info([
        "/*********************************************************************************************************************************/",
        `We will attempt to upgrade the ${log.info.highlight(
            "vpc.ts"
        )} configuration in your your project's ${log.info.highlight("prod")} environment!`,
        `If you had some custom changes in it, please review and add them again.`,
        "/**********************************************************************************************************************************/"
    ]);

    const copyToTarget = path.join(context.project.root, pulumiProdVpcProjectFile);
    if (!fs.existsSync(copyToTarget)) {
        log.error(
            `The ${log.info.highlight("vpc.ts")} file of your ${log.info.highlight(
                "prod"
            )} environment was not found at ${log.info.highlight(copyToTarget)}.`
        );
        log.info(`Location should be: ${copyToTarget}`);
        return;
    }

    const copyFromTarget = path.join(context.project.root, pulumiProdVpcNodeModulesFile);

    if (!fs.existsSync(copyFromTarget)) {
        log.error(`Source file for ${log.info.highlight("vpc.ts")} was not found!`);
        log.info(`Are you sure you updated dependencies to version 5.22.0?`);
        return;
    }

    try {
        fs.copyFileSync(copyFromTarget, copyToTarget);
    } catch (ex) {
        log.error(`Could not copy "${copyFromTarget}" to "${copyToTarget}".`);
        log.error(ex.message);
    }
};
module.exports = { upgradeApiPulumi };
