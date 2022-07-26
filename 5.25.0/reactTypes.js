const { log } = require("../utils");
const path = require("path");
const fs = require("fs-extra");
const target = "node_modules/@webiny/cwp-template-aws/template/common/types/react";

const copyTypesToUserProject = async context => {
    if (!context.project || !context.project.root) {
        log.error("Missing context.project or context.project.root to upgrade the React types.");
        return;
    }

    const source = path.join(context.project.root, target);
    const destination = path.join(context.project.root, "types/react/");

    if (fs.pathExistsSync(destination) === true) {
        log.error(`Path "${destination}" already exists, skipping...`);
        return;
    }

    log.info(`Copying from "${source}" to "${destination}"...`);
    fs.copySync(source, destination, {
        overwrite: false
    });
    log.info("... done");
};

module.exports = {
    run: copyTypesToUserProject
};
