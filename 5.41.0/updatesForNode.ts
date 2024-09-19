import { createPackageJsonModifier, createProcessor, yarnUp } from "../utils";
import path from "path";

export const updatesForNode = createProcessor(async params => {
    const { context } = params;

    const mainPackageJsonPath = path.join(context.project.root, "package.json");
    context.log.info("Setting engines node ^20 in main package.json file...");

    const mainPackageJsonModifier = createPackageJsonModifier(mainPackageJsonPath);

    mainPackageJsonModifier.modify({
        engines: {
            node: "~20.0.0"
        }
    });
    context.log.info("...done.");

    context.log.info(`Increasing the "@types/node" version to ^20.0.0...`);
    await yarnUp({
        "@types/node": "^20.0.0"
    });
    context.log.info(`...done.`);
});
