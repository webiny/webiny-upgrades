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

    log.info(`Updating plugins in ${log.info.hl(editorPluginsPath)} file...`);

    if (fs.existsSync(editorPluginsPath)) {
        let editorPluginsFile = fs.readFileSync(editorPluginsPath, "utf8");
        if (editorPluginsFile.includes(ACTION_PLUGIN_IMPORT)) {
            log.warning(
                `Could not update ${log.warning.hl(
                    editorPluginsPath
                )} - the following import already exists:`
            );
            log.warning(ACTION_PLUGIN_IMPORT);
            console.log()
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
                `Could not update ${log.warning.hl(
                    editorPluginsPath
                )}. Please open it and manually add the import statement and register the ${log.warning.hl(
                    "action"
                )} plugin:`
            );
            log.warning(ACTION_PLUGIN_IMPORT);
            console.log()
            return;
        }
    } else {
        log.warning(
            `Could not update plugins in ${log.warning.hl(
                editorPluginsPath
            )} - file does not exist.`
        );
        console.log()
        return;
    }

    log.success(`Plugins in ${log.success.hl(editorPluginsPath)} file successfully updated.`);

    console.log();
};
