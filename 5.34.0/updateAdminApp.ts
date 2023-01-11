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
        context.log.error(`Missing Headless CMS plugins file (%s).`, "skipping upgrade");
        return;
    }

    const source = project.getSourceFile(file.path);
    if (!source) {
        context.log.error(`Missing source for %s file(%s).`, file.path, "skipping upgrade");
        return;
    }

    const { removeMap } = await import("./removeImports");

    Object.keys(removeMap).forEach(key => {
        removeFromExportDefaultArray({ source, target: key });
        removeImportFromSourceFile(source, removeMap[key], { quiet: true });
    });
};
