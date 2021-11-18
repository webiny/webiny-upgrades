const glob = require("fast-glob");
const path = require("path");
const fs = require("fs");
const { log } = require("../utils");

module.exports = async context => {
    log.info(`Updating ${log.info.hl("webiny.config.js")} files...`);

    const project = context.project;
    const configsPaths = await glob(project.root + "/**/webiny.config.{js,ts}", {
        ignore: project.root + "/**/node_modules/**"
    });

    log.info(`Found ${log.info.hl(configsPaths.length)} files...`);

    console.log();

    const errors = [];
    for (let i = 0; i < configsPaths.length; i++) {
        const configPath = configsPaths[i];

        try {
            if (configPath.includes("/api/code/")) {
                handleApiConfig({ configPath, context });
            } else if (configPath.includes("/apps/admin/")) {
                handleAppsAdminConfig({ configPath, context });
                continue;
            } else if (configPath.includes("/apps/website/")) {
                handleAppsWebsiteConfig({ configPath, context });
                continue;
            } else {
                // Custom config files.
                handleCustomConfig({ configPath, context });
            }

            if (configPath.endsWith(".js")) {
                log.warning(
                    `Removing old ${log.warning.hl(
                        configPath
                    )} file (using ${log.warning.hl("webiny.config.ts")} now).`
                );
                fs.unlinkSync(configPath);
            }
        } catch (error) {
            errors.push({ configPath, error });
        }
    }
};

const handleApiConfig = ({ configPath, context }) => {
    const dest = path.join(path.dirname(configPath), "webiny.config.ts");
    if (configPath.includes("/transform/")) {
        log.info(`Updating ${log.info.hl(dest)}.`);
        fs.copyFileSync(
            path.join(__dirname, "webinyConfigJsUpdates", "files", "fm.transform.webiny.config.ts"),
            dest
        );
        log.success("Config file successfully updated.");
        console.log()
        return;
    }

    if (configPath.includes("/prerenderingService/")) {
        log.info(`Updating ${log.info.hl(dest)}.`);
        fs.copyFileSync(
            path.join(__dirname, "webinyConfigJsUpdates", "files", "ps.webiny.config.ts"),
            dest
        );
        log.success("Config file successfully updated.");
        console.log()
        return;
    }

    log.info(`Updating ${log.info.hl(dest)}.`);
    fs.copyFileSync(
        path.join(__dirname, "webinyConfigJsUpdates", "files", "function.webiny.config.ts"),
        dest
    );

    log.success("Config file successfully updated.");
    console.log()
};

const handleAppsAdminConfig = ({ configPath, context }) => {
    const dest = path.join(path.dirname(configPath), "webiny.config.ts");
    log.info(`Updating ${log.info.hl(dest)}.`);
    log.warning(
        `Note that the ${log.warning.hl(
            "start"
        )} command will be renamed to ${log.warning.hl("watch")}.`
    );
    fs.copyFileSync(
        path.join(__dirname, "webinyConfigJsUpdates", "files", "admin.webiny.config.ts"),
        dest
    );

    log.success("Config file successfully updated.");
    console.log()

};

const handleAppsWebsiteConfig = ({ configPath, context }) => {
    const dest = path.join(path.dirname(configPath), "webiny.config.ts");
    log.info(`Updating ${log.info.hl(dest)}.`);
    log.warning(
        `Note that the ${log.warning.hl(
            "start"
        )} command will be renamed to ${log.warning.hl("watch")}.`
    );
    fs.copyFileSync(
        path.join(__dirname, "webinyConfigJsUpdates", "files", "website.webiny.config.ts"),
        dest
    );

    log.success("Config file successfully updated.");
    console.log()
};

const handleCustomConfig = ({ configPath, context }) => {
    const dest = path.join(path.dirname(configPath), "webiny.config.ts");
    // Detect type of config and replace it with the correct updated one.
    log.info(`Updating ${log.info.hl(dest)}.`);
    let content = fs.readFileSync(configPath, "utf8");

    if (content.includes("buildApp")) {
        if (content.includes(`await buildApp(options, context);`)) {
            content = content.replace(
                `await buildApp(options, context);`,
                `const build = createBuildApp({ cwd: __dirname }); await build(options);`
            );

            content = content.replace(
                `await startApp(options, context);`,
                `const watch = createWatchApp({ cwd: __dirname }); await watch(options);`
            );

            content = content.replace(/startApp/g, "createWatchApp");
            content = content.replace(/buildApp/g, "createBuildApp");
            fs.writeFileSync(dest, content);

            log.success("Config file successfully updated.");
            console.log()
            return;
        }

        context.error(`Could not update ${configPath}. Please update it manually.`);
        console.log();
        return;
    }

    let src;
    if (content.includes("buildFunction")) {
        src = path.join(__dirname, "webinyConfigJsUpdates", "files", "function.webiny.config.ts");
    }

    if (content.includes("buildPackage")) {
        src = path.join(__dirname, "webinyConfigJsUpdates", "files", "package.webiny.config.ts");
    }

    if (src) {
        fs.copyFileSync(src, dest);
        log.success("Config file successfully updated.");
        console.log()
    } else {
        context.error(`Could not update ${configPath}. Please update it manually.`);
        console.log();
    }
};
