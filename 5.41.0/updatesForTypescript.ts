import { createProcessor, removePackagesFromResolutions, yarnUp } from "../utils";

export const updatesForTypescript = createProcessor(async params => {
    const { context } = params;

    const mainPackageJsonPath = context.project.getPackageJsonPath();

    context.log.info(`Removing the "typescript" package from main package.json resolutions key.`);

    removePackagesFromResolutions({
        context,
        targetPath: mainPackageJsonPath,
        packages: ["typescript"]
    });

    await yarnUp({
        typescript: "4.9.5"
    });
});
