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

    log.info(
        `We will try to upgrade your projects "prod" environment vpc.ts file. If you had some custom changes in it, please add them again.`
    );

    const copyToTarget = path.join(context.project.root, pulumiProdVpcProjectFile);
    if (!fs.existsSync(copyToTarget)) {
        log.error(
            `Could not determine the location of your project's api production environment "vpc.ts" location.`
        );
        log.info(`Location should be: ${copyToTarget}`);
        return;
    }
    const copyFromTarget = path.join(context.project.root, pulumiProdVpcNodeModulesFile);
    if (!fs.existsSync(copyFromTarget)) {
        log.error(
            `Could not determine the location of node_modules api production environment "vpc.ts" location.`
        );
        log.info(`Location should be: ${copyFromTarget}`);
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
