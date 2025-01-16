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

export interface IYarnUpOptions {
    quiet?: boolean;
}

export const yarnUp = async (input: IYarnUpDependency, options?: IYarnUpOptions): Promise<void> => {
    const { quiet } = options || {};
    if (quiet) {
        log.setQuiet(["info"]);
    }

    const packages: string[] = [];

    for (const pkg in input) {
        const version = input[pkg];

        let isValid = semver.valid(version);
        if (!isValid) {
            isValid = semver.validRange(version);
        }

        if (!isValid) {
            log.error(`Package "${pkg}" version "${version}" is not a valid semver version.`);
            continue;
        }

        packages.push(`${pkg}@${version}`);
    }
    try {
        log.info(`Updating packages...`);
        await execa(`yarn`, [`up`, ...packages], { cwd: process.cwd() });
        log.info(`...done.`);
    } catch (ex) {
        log.setLoud();
        log.error(`Updating of the packages failed.`);
        console.log(ex);
        console.log(log.error(ex.message));
        if (ex.stdout) {
            console.log(ex.stdout);
        }
    }
    log.setLoud();
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

    context.log.info(`Updating yarn to version ${version}.`);
    try {
        await execa("yarn", ["set", "version", version]);
        context.log.info("...done.");
    } catch (ex) {
        context.log.error(`Failed to update Yarn to version "${version}".`);
        console.log(ex);
        throw ex;
    }
};
