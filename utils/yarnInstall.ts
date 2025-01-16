import execa from "execa";
import log from "./log";

export interface IYarnInstallOptions {
    quiet?: boolean;
}
/**
 * Run to install new packages in the project.
 */
export const yarnInstall = async (options?: IYarnInstallOptions): Promise<void> => {
    if (options?.quiet === true) {
        log.setQuiet(["info", "success"]);
    }
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
    log.setLoud();
};
