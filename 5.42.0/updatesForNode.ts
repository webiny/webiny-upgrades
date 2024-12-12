import { createPackageJsonModifier, createProcessor, yarnUp } from "../utils";

export const updatesForNode = createProcessor(async params => {
    const { context } = params;

    const mainPackageJsonPath = context.project.getPackageJsonPath();

    const mainPackageJsonModifier = createPackageJsonModifier(mainPackageJsonPath);

    context.log.info(`Setting "engines.node" ">=22 <23" in main package.json file...`);
    mainPackageJsonModifier.modify({
        engines: {
            node: ">=22 <23"
        }
    });
    context.log.info("...done.");

    await yarnUp({
        "@types/node": "^22.10.1"
    });
});
