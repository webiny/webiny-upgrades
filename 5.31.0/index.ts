import { Context } from "../types";
import { createMorphProject, prettierFormat, yarnInstall } from "../utils";

import { getAllFiles } from "./files";

module.exports = async (context: Context) => {
    const files = getAllFiles(context);
    const project = createMorphProject(files);

    /**
     *
     */

    // Save file changes.
    await project.save();

    // Format updated files.
    await prettierFormat(files);

    // Install dependencies.
    await yarnInstall();
};
