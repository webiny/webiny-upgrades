import { Project } from "ts-morph";
import { addToExportDefaultArray, insertImportToSourceFile } from "../utils";
import { Context, IFiles } from "../types";

interface Params {
    files: IFiles;
    project: Project;
    context: Context;
}

export const updateAdminApp = async (params: Params) => {
    const { project, files } = params;

    const editorPluginsFile = files.byName("admin/plugins/pageBuilder/editorPlugins.ts");
    const source = project.getSourceFile(editorPluginsFile.path);

    insertImportToSourceFile({
        source,
        name: "cellSettings",
        moduleSpecifier: "@webiny/app-page-builder/editor/plugins/elementSettings/cell",
        after: "@webiny/app-page-builder/editor/plugins/elementSettings/grid"
    });

    addToExportDefaultArray({
        source,
        target: "cellSettings"
    });
};
