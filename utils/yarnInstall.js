const execa = require("execa");
const log = require("./log");

/**
 * Run to install new packages in the project.
 */
const yarnInstall = async () => {
    try {
        log.info("Installing new packages...");
        await execa("yarn", { cwd: process.cwd() });
        log.success("Packages installed successfully.");
        console.log();
    } catch (ex) {
        log.error("Installation of new packages failed.");
        console.log(ex.message);
        if (ex.stdout) {
            console.log(ex.stdout);
        }
    }
};

module.exports = yarnInstall;
