const glob = require("fast-glob");
const { log } = require("@webiny/cli/utils");

const { createMorphProject, yarnInstall, prettierFormat } = require("../utils");

const apiHeadlessCms = require("./apiHeadlessCms");
const webinyConfigJsUpdates = require("./webinyConfigJsUpdates");
const newCliPlugins = require("./newCliPlugins");

module.exports = async context => {
    const start = new Date();

    const { info } = context;

    const files = await glob([
        // add files here
        ...Object.values(apiHeadlessCms.files(context))
        //
    ]);

    if (files.length > 0) {
        const project = createMorphProject(files);
        /**
         * Upgrade the API Headless CMS files.
         */
        info("Starting with API Headless CMS upgrade.");

        apiHeadlessCms.upgradeGraphQL(project, context);
        apiHeadlessCms.upgradeHeadlessCMS(project, context);

        info("Writing changes...");
        await project.save();
        console.log();
    }

    // Generates new webiny.config.ts files (with new build and watch commands).
    await webinyConfigJsUpdates(context);

    // Generates new Webiny CLI (post-deploy) plugins for both Admin Area and Website React applications.
    await newCliPlugins(context);

    // Format updated files.
    await prettierFormat(files, context);

    /**
     * Install new packages.
     */
    await yarnInstall({
        context
    });

    const duration = (new Date() - start) / 1000;
    log.success(`Upgrade completed in ${log.success.hl(duration)}s.`);
};
