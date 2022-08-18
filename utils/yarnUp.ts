import execa from "execa";
import log from "./log";

interface Params {
    targetVersion: string;
}
export const yarnUp = async ({ targetVersion }: Params): Promise<void> => {
    try {
        log.info(`Updating all package versions to ${targetVersion}...`);
        await execa(`yarn`, [`up`, `@webiny/*@${targetVersion}`], { cwd: process.cwd() });
        await execa("yarn", { cwd: process.cwd() });
        log.info("Finished update packages.");
    } catch (ex) {
        log.error("Updating of the packages failed.");
        console.log(ex);
        console.log(log.error(ex.message));
        if (ex.stdout) {
            console.log(ex.stdout);
        }
    }
};
