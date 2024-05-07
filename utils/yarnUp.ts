import execa from "execa";
import log from "./log";
import semver from "semver";

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

export interface IYarnUpDependency {
    [pkg: string]: string;
}

export const yarnUpDependency = async (packages: IYarnUpDependency): Promise<void> => {
    for (const pkg in packages) {
        const version = packages[pkg];
        const isValid = semver.valid(version);
        if (!isValid) {
            continue;
        }
        try {
            log.info(`Updating package "${pkg}" version to "${version}"...`);
            await execa(`yarn`, [`up`, `${pkg}@${version}`], { cwd: process.cwd() });
            await execa("yarn", { cwd: process.cwd() });
            log.info(`Finished updating package" ${pkg}".`);
        } catch (ex) {
            log.error(`Updating of the package "${pkg}" to version "${version}" failed.`);
            console.log(ex);
            console.log(log.error(ex.message));
            if (ex.stdout) {
                console.log(ex.stdout);
            }
        }
    }
};
