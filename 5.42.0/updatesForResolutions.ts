import { createProcessor, removePackagesFromResolutions } from "../utils";

export const updatesForResolutions = createProcessor(async params => {
    const { context } = params;

    const mainPackageJsonPath = context.project.getPackageJsonPath();

    context.log.info("Fixing root package.json resolutions...");

    removePackagesFromResolutions({
        context,
        targetPath: mainPackageJsonPath,
        packages: ["eslint", "typescript"]
    });
    context.log.info("...done.");
});
