import { Context } from "../types";
import { createMorphProject, prettierFormat, yarnInstall } from "../utils";

import { getAllFiles } from "./files";
import { upgradePackages } from "./packages";

module.exports = async (context: Context) => {
    const files = getAllFiles(context);
    const project = createMorphProject(files);

    /**
     *
     */

    // Save file changes.
    await project.save();

    // Upgrade packages.
    upgradePackages(context);

    // Format updated files.
    await prettierFormat(files);

    // Install dependencies.
    await yarnInstall();
};
