import { addPackagesToResolutions, createProcessor, yarnUp } from "../utils";

export const upgradeTypescript = createProcessor(async params => {
    const { context, files } = params;

    const rootPackageJson = files.byName("package.json");

    addPackagesToResolutions({
        context,
        packages: {
            typescript: "5.3.3"
        },
        targetPath: rootPackageJson.path
    });

    await yarnUp({
        typescript: "5.3.3"
    });
});
