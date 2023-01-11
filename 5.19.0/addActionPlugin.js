const { log } = require("../utils");
const fs = require("fs");
const path = require("path");

const LINK_PLUGIN_IMPORT =
    'import link from "@webiny/app-page-builder/editor/plugins/elementSettings/link";';
const ACTION_PLUGIN_IMPORT =
    'import action from "@webiny/app-page-builder/editor/plugins/elementSettings/action";';

module.exports = async context => {
    const editorPluginsPath = path.join(
        context.project.root,
        "apps",
        "admin",
        "code",
        "src",
        "plugins",
        "pageBuilder",
        "editorPlugins.ts"
    );

    log.info(`Updating plugins in %s file...`, editorPluginsPath);

    if (fs.existsSync(editorPluginsPath)) {
        let editorPluginsFile = fs.readFileSync(editorPluginsPath, "utf8");
        if (editorPluginsFile.includes(ACTION_PLUGIN_IMPORT)) {
            log.warning(
                `Could not update %s - the following import already exists:`,
                editorPluginsPath
            );
            log.warning(ACTION_PLUGIN_IMPORT);
            console.log();
            return;
        }

        if (editorPluginsFile.includes(LINK_PLUGIN_IMPORT)) {
            editorPluginsFile = editorPluginsFile.replace(
                LINK_PLUGIN_IMPORT,
                `${LINK_PLUGIN_IMPORT}
${ACTION_PLUGIN_IMPORT}`
            );

            editorPluginsFile = editorPluginsFile.replace(
                "link,",
                `link,
    action,`
            );

            fs.writeFileSync(editorPluginsPath, editorPluginsFile);
        } else {
            log.warning(
                `Could not update %s. Please open it and manually add the import statement and register the %s plugin:`,
                editorPluginsPath,
                "action"
            );
            log.warning(ACTION_PLUGIN_IMPORT);
            console.log();
            return;
        }
    } else {
        log.warning(`Could not update plugins in %s - file does not exist.`, editorPluginsPath);
        console.log();
        return;
    }

    log.success(`Plugins in %s file successfully updated.`, editorPluginsPath);

    console.log();
};
