import { addPackagesToResolutions, createProcessor, yarnInstall } from "../utils";

export const addBabelDependencies = createProcessor(async ({ context }) => {
    const targetPath = context.project.getPackageJsonPath();

    context.log.info("Adding babel dependencies...");
    /**
     * We want to add packages to dev dependencies.
     */
    addPackagesToResolutions({
        context,
        targetPath,
        packages: {
            "@babel/runtime": "7.25.0"
        }
    });

    await yarnInstall({
        quiet: true
    });

    context.log.info("...done.");
});
