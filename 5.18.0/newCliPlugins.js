const path = require("path");
const fs = require("fs");
const util = require("util");
const ncpBase = require("ncp");
const ncp = util.promisify(ncpBase.ncp);
const { log } = require("../utils");

module.exports = async context => {
    log.info(`Inserting new Admin Area and Website CLI plugins...`);
    console.log();

    const project = context.project;
    const projectTsPath = path.join(project.root, "webiny.project.ts");

    if (!fs.existsSync(projectTsPath)) {
        log.warning(
            `Skipping inserting new Admin Area and Website CLI plugins - ${log.warning.hl(
                projectTsPath
            )} does not exist.`
        );
        console.log();
        return;
    }

    let projectTs = fs.readFileSync(projectTsPath, "utf8");

    const apps = {
        admin: fs.existsSync(path.join(project.root, "apps", "admin")),
        website: fs.existsSync(path.join(project.root, "apps", "website"))
    };

    const src = path.join(__dirname, "newCliPlugins", "admin", "cli");
    const dest = path.join(project.root, "apps", "admin", "cli");
    log.info(`Inserting new CLI plugins into ${log.info.hl(dest)}.`);

    if (apps.admin) {
        await ncp(src, dest);
        log.success("CLI plugins successfully inserted.");
    } else {
        log.warning(
            `Skipping insertion of new CLI plugins into ${log.warning.hl(
                dest
            )}, it seems that the ${log.warning.hl(
                "Admin Area"
            )} project application doesn't exist.`
        );
    }
    console.log();

    const src2 = path.join(__dirname, "newCliPlugins", "website", "cli");
    const dest2 = path.join(project.root, "apps", "website", "cli");
    log.info(`Inserting new CLI plugins into ${log.info.hl(dest2)}.`);
    if (apps.website) {
        await ncp(src2, dest2);
        log.success("CLI plugins successfully inserted.");
    } else {
        log.warning(
            `Skipping insertion of new CLI plugins into ${log.warning.hl(
                dest2
            )}, it seems that the ${log.warning.hl("Website")} project application doesn't exist.`
        );
    }

    console.log();

    // Adjust root webiny.project.ts - update plugins.
    log.info(`Updating root ${log.info.hl(`webiny.project.ts`)} manifest file...`);

    projectTs = projectTs.replace('import cliPageBuilder from "@webiny/api-page-builder/cli";', "");

    projectTs = projectTs.replace(
        'import cliWorkspaces from "@webiny/cli-plugin-workspaces";',
        `import cliWorkspaces from "@webiny/cli-plugin-workspaces";
// Admin Area and Website CLI plugins.
${apps.admin ? 'import adminPlugins from "./apps/admin/cli";' : ""}
${apps.website ? 'import websitePlugins from "./apps/website/cli";' : ""}`
    );

    projectTs = projectTs.replace("cliPageBuilder(),", ``);

    projectTs = projectTs.replace(
        "cliWorkspaces(),",
        `cliWorkspaces(),
            // Admin Area and Website CLI plugins.
            ${apps.admin ? "adminPlugins," : ""}
            ${apps.website ? "websitePlugins," : ""}`
    );

    fs.writeFileSync(projectTsPath, projectTs);
    log.success(`Root ${log.success.hl(`webiny.project.ts`)} manifest file successfully updated.`);

    console.log();
};
