import execa from "execa";
import log from "./log";
import semver from "semver";
import { Context } from "../types";

export interface IYarnUpParams {
    targetVersion: string;
}

export const yarnUpWebiny = async ({ targetVersion }: IYarnUpParams): Promise<void> => {
    return yarnUp({
        [`@webiny/*`]: targetVersion
    });
};

export interface IYarnUpDependency {
    [pkg: string]: string;
}

export const yarnUp = async (packages: IYarnUpDependency): Promise<void> => {
    for (const pkg in packages) {
        const version = packages[pkg];

        let isValid = semver.valid(version);
        if (!isValid) {
            isValid = semver.validRange(version);
        }

        if (!isValid) {
            log.error(`Package "${pkg}" version "${version}" is not a valid semver version.`);
            continue;
        }
        try {
            log.info(`Updating package "${pkg}" version to "${version}"...`);
            await execa(`yarn`, [`up`, `${pkg}@${version}`], { cwd: process.cwd() });
            await execa("yarn", { cwd: process.cwd() });
            log.info(`...done.`);
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

export type YarnVersion = string | `${number}.${number}.${number}` | "berry";

export interface IUpdateYarnParams {
    context: Context;
    version: YarnVersion;
}

export const updateYarn = async (params: IUpdateYarnParams) => {
    const { context, version } = params;

    if (version !== "berry") {
        if (!semver.valid(version)) {
            const message = `Version "${version}" is not a valid semver version.`;
            context.log.error(message);
            throw new Error(message);
        }
    }

    try {
        context.log.info(`Updating yarn to version ${version}.`);
        await execa("yarn", ["set", "version", version]);
        context.log.info("...done.");
    } catch (ex) {
        context.log.error(`Failed to update Yarn to version "${version}".`);
        console.log(ex);
        throw ex;
    }
};
