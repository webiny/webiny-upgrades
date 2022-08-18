import fs from "fs";
import path from "path";
import log from "./log";
import { Context } from "../types";

const pulumiCliCachePath = `.webiny/pulumi-cli`;

const logToRemove = (): void => {
    log.error(`Cannot automatically remove Pulumi CLI cache, please do it manually.`);
    log.info(`Directory to remove: $YOUR_PROJECT_ROOT/${pulumiCliCachePath}`);
};

export const removePulumiCache = async (context: Context): Promise<void> => {
    if (!context.project || !context.project.root) {
        log.error("Missing definition for project root directory.");
        logToRemove();
        return;
    }

    log.info(`Removing Pulumi CLI cache directory...`);
    const target = path.join(context.project.root, pulumiCliCachePath);
    if (fs.existsSync(target) !== true) {
        log.error(`Missing directory "${pulumiCliCachePath}" in your project root.`);
        logToRemove();
        return;
    }

    const renamedTarget = `${pulumiCliCachePath}.${Date.now()}`;

    const renamedTargetPath = path.join(context.project.root, renamedTarget);

    try {
        fs.renameSync(target, renamedTargetPath);
    } catch (ex) {
        log.error(ex.message);
        logToRemove();

        return;
    }
    log.info("Successfully removed Pulumi CLI cache directory.");
};
