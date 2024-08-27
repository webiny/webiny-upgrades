import { createProcessor, removePackagesFromResolutions, yarnUp } from "../utils";
import path from "path";

export const updatesForTypescript = createProcessor(async params => {
    const { context } = params;

    const mainPackageJsonPath = path.join(context.project.root, "package.json");

    context.log.info(`Removing the "typescript" package from main package.json resolutions key.`);

    removePackagesFromResolutions({
        context,
        targetPath: mainPackageJsonPath,
        packages: ["typescript"]
    });

    context.log.info(`Increasing the "typescript" version to 4.9.5...`);
    await yarnUp({
        typescript: "4.9.5"
    });
    context.log.info(`...done.`);
});
