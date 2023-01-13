import { Project } from "ts-morph";
import path from "path";
import { Files } from "../utils";
import { Context } from "../types";
import { backupAndReplace } from "./backupAndReplace";

interface Params {
    files: Files;
    project: Project;
    context: Context;
}

export const updateAdmin = async (params: Params) => {
    const { files, context } = params;

    const editorPluginsFile = files.byName("admin/plugins/pageBuilder/editorPlugins.ts");
    backupAndReplace(
        context,
        editorPluginsFile,
        path.join(__dirname, "replacements", "admin", "admin_plugins_pageBuilder_editorPlugins.ts")
    );
};
