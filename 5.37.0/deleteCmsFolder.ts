import { Project } from "ts-morph";
import { Context, IFiles } from "../types";

import fs from "fs";
import path from "path";

interface Params {
    files: IFiles;
    project: Project;
    context: Context;
}

export const deleteCmsFolder = async (params: Params) => {
    const apiCmsFolderPath = path.join(params.context.project.root, "apps/api/headlessCMS");
    if (fs.existsSync(apiCmsFolderPath)) {
        params.context.log.info(
            `Deleting %s folder (no longer required)...`,
            "apps/api/headlessCMS"
        );
        fs.rmSync(apiCmsFolderPath, { recursive: true, force: true });
        return;
    }

    return { skipped: true };
};
