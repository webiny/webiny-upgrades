import { Project } from "ts-morph";
import { Files, removeImportFromSourceFile, removeFromExportDefaultArray } from "../utils";
import { Context } from "../types";

interface Params {
    files: Files;
    project: Project;
    context: Context;
}

export const updateAdminApp = async (params: Params) => {
    const { context, project, files } = params;

    const file = files.byName("admin/headlessCms");

    if (!file) {
        context.log.error(`Missing ${file.path} file. Skipping...`);
        return;
    }

    const source = project.getSourceFile(file.path);
    if (!source) {
        context.log.error(`Missing source for ${file.path} file. Skipping...`);
        return;
    }

    const { removeMap } = await import("./removeImports");

    Object.keys(removeMap).forEach(key => {
        removeFromExportDefaultArray({ source, target: key });
        removeImportFromSourceFile(source, removeMap[key]);
    });
};
