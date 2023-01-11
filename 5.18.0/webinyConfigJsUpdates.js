const glob = require("fast-glob");
const path = require("path");
const fs = require("fs");
const { log } = require("../utils");

module.exports = async context => {
    log.info(`Updating %s files...`, "webiny.config.js");

    const project = context.project;
    const configsPaths = await glob(project.root + "/**/webiny.config.{js,ts}", {
        ignore: project.root + "/**/node_modules/**"
    });

    log.info(`Found %s files...`, configsPaths.length);

    console.log();

    for (let i = 0; i < configsPaths.length; i++) {
        const configPath = configsPaths[i];

        try {
            if (configPath.includes("/api/code/")) {
                handleApiConfig({ configPath });
            } else if (configPath.includes("/apps/admin/")) {
                handleAppsAdminConfig({ configPath });
                continue;
            } else if (configPath.includes("/apps/website/")) {
                handleAppsWebsiteConfig({ configPath });
                continue;
            } else {
                // Custom config files.
                handleCustomConfig({ configPath });
            }

            if (configPath.endsWith(".js")) {
                log.warning(`Removing old %s file (using %s now).`, configPath, "webiny.config.ts");
                fs.unlinkSync(configPath);
            }
        } catch (error) {
            log.error(`An error occurred while processing %s:`, configPath);
            console.log(error);
        }
    }
};

const handleApiConfig = ({ configPath }) => {
    const dest = path.join(path.dirname(configPath), "webiny.config.ts");
    if (configPath.includes("/transform/")) {
        log.info(`Updating %s.`, dest);
        fs.copyFileSync(
            path.join(__dirname, "webinyConfigJsUpdates", "files", "fm.transform.webiny.config.ts"),
            dest
        );
        log.success("Config file successfully updated.");
        console.log();
        return;
    }

    if (configPath.includes("/prerenderingService/")) {
        log.info(`Updating %s.`, dest);
        fs.copyFileSync(
            path.join(__dirname, "webinyConfigJsUpdates", "files", "ps.webiny.config.ts"),
            dest
        );
        log.success("Config file successfully updated.");
        console.log();
        return;
    }

    log.info(`Updating %s.`, dest);
    fs.copyFileSync(
        path.join(__dirname, "webinyConfigJsUpdates", "files", "function.webiny.config.ts"),
        dest
    );

    log.success("Config file successfully updated.");
    console.log();
};

const handleAppsAdminConfig = ({ configPath }) => {
    const dest = path.join(path.dirname(configPath), "webiny.config.ts");
    log.info(`Updating %s.`, dest);
    log.warning(`Note that the %s command will be renamed to %s.`, "start", "watch");
    fs.copyFileSync(
        path.join(__dirname, "webinyConfigJsUpdates", "files", "admin.webiny.config.ts"),
        dest
    );

    log.success("Config file successfully updated.");
    console.log();
};

const handleAppsWebsiteConfig = ({ configPath }) => {
    const dest = path.join(path.dirname(configPath), "webiny.config.ts");
    log.info(`Updating %s.`, dest);
    log.warning(`Note that the %s command will be renamed to %s.`, "start", "watch");
    fs.copyFileSync(
        path.join(__dirname, "webinyConfigJsUpdates", "files", "website.webiny.config.ts"),
        dest
    );

    log.success("Config file successfully updated.");
    console.log();
};

const handleCustomConfig = ({ configPath }) => {
    const dest = path.join(path.dirname(configPath), "webiny.config.ts");
    // Detect type of config and replace it with the correct updated one.
    log.info(`Updating %s.`, dest);
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
            console.log();
            return;
        }

        log.error(`Could not update ${configPath}. Please update it manually.`);
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
        console.log();
    } else {
        log.error(`Could not update ${configPath}. Please update it manually.`);
        console.log();
    }
};
