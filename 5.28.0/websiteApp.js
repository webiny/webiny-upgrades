const { log } = require("../utils");
const { join } = require("path");
const fs = require("fs-extra");

const copyFiles = async context => {
    if (!context.project || !context.project.root) {
        log.error("Missing context.project or context.project.root to upgrade the Website app.");
        return;
    }

    const sourceDir = join(
        context.project.root,
        "node_modules/@webiny/cwp-template-aws/template/common/apps/website/code/src/components/Page"
    );
    const destDir = join(context.project.root, "apps/website/code/src/components/Page");

    const files = ["index.tsx", "graphql.ts"];

    const rel = path => path.replace(context.project.root, "");

    for (const file of files) {
        const sourceFile = join(sourceDir, file);
        const destFile = join(destDir, file);
        log.info(`Copying from "${rel(sourceFile)}" to "${rel(destFile)}"...`);

        fs.copySync(sourceFile, destFile, { overwrite: true });
    }

    log.info("... done");
};

module.exports = {
    run: copyFiles
};
