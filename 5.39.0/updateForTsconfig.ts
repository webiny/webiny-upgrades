import path from "path";
import fs from "fs-extra";
import { createProcessor } from "../utils";

const tsconfig = "tsconfig.build.json";

export const updateForTsconfig = createProcessor(async ({ context }) => {
    const sourceTsconfigPath = path.join(
        context.project.root,
        "node_modules",
        "@webiny",
        "cwp-template-aws",
        "template",
        "common",
        tsconfig
    );

    const destinationTsconfigPath = path.join(context.project.root, tsconfig);

    await fs.copy(sourceTsconfigPath, destinationTsconfigPath, { overwrite: true });

    context.log.success(`Replaced %s in the project root!`, tsconfig);
    context.log.warning(
        `If you made any customizations to the %s in the past, make sure you transfer them to the new config file!`,
        tsconfig
    );
});
