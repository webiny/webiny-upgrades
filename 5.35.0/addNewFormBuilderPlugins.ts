import { Project } from "ts-morph";
import { Files, insertImportToSourceFile, addToExportDefaultArray } from "../utils";
import { Context } from "../types";

interface Params {
    files: Files;
    project: Project;
    context: Context;
}

export const addNewFormBuilderPlugins = async (params: Params) => {
    const { project, files, context } = params;

    const fbPluginsFile = files.byName("admin/plugins/formBuilder.ts");
    const source = project.getSourceFile(fbPluginsFile.path);

    context.log.info(
        `Adding new Form Builder plugins in the Admin app plugins (%s)`,
        fbPluginsFile.path
    );

    insertImportToSourceFile({
        source,
        name: "editorTriggerEmailNotification",
        moduleSpecifier: "@webiny/app-form-builder/admin/plugins/editor/triggers/emailNotification",
        after: "@webiny/app-form-builder/admin/plugins/editor/triggers/webhook"
    });

    addToExportDefaultArray({
        source,
        target: "editorTriggerEmailNotification"
    });

    insertImportToSourceFile({
        source,
        name: "editorTriggerEmailThanks",
        moduleSpecifier: "@webiny/app-form-builder/admin/plugins/editor/triggers/emailThanks",
        after: "@webiny/app-form-builder/admin/plugins/editor/triggers/emailNotification"
    });

    addToExportDefaultArray({
        source,
        target: "editorTriggerEmailThanks"
    });

    context.log.info("New Form Builder plugins added.");
};
