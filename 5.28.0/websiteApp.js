const { log } = require("../utils");
const path = require("path");
const fs = require("fs-extra");

const copyFiles = async context => {
    if (!context.project || !context.project.root) {
        log.error("Missing context.project or context.project.root to upgrade the Website app.");
        return;
    }

    const sourceDir = path.join(
        context.project.root,
        "node_modules/@webiny/cwp-template-aws/template/common/apps/website/code/src/components/Page"
    );
    const destDir = path.join(context.project.root, "apps/website/code/src/components/Page");

    const files = ["index.tsx", "graphql.ts"];

    for (const file of files) {
        const sourceFile = path.join(sourceDir, file);
        const destFile = path.join(context.project.root, destDir, file);
        log.info(`Copying from "${sourceFile}" to "${destFile}"...`);

        fs.copySync(sourceFile, destFile, { overwrite: true });
    }

    log.info("... done");
};

module.exports = {
    run: copyFiles
};
