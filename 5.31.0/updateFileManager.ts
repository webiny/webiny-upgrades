import { Files } from "./classes/Files";
import { Project } from "ts-morph";
import { Context } from "../types";
import {
    addPluginToCreateHandler,
    insertImportToSourceFile,
    removeImportFromSourceFile,
    removePluginFromCreateHandler,
    upgradeCreateHandlerToPlugins
} from "../utils";

interface Params {
    files: Files;
    project: Project;
    context: Context;
}
export const updateFileManager = async (params: Params): Promise<void> => {
    await updateDownload(params);
    await updateManage(params);
    await updateTransform(params);
};

interface UpdateParams {
    files: Files;
    context: Context;
    project: Project;
}
const updateDownload = async ({ context, files, project }: UpdateParams): Promise<void> => {
    const indexFile = files.byName("fm/download");
    if (!indexFile) {
        context.log.error(`Missing FileManager Download index file. Skipping...`);
        return;
    }
    const source = project.getSourceFile(indexFile.path);
    if (!source) {
        context.log.error(`Missing Source of FileManager Download index file. Skipping...`);
        return;
    }
    if (source.getText().match("createDownloadFilePlugins") !== null) {
        context.log.info(
            `It seems File Manager Download index file was already upgraded. Skipping...`
        );
        return;
    }
    /**
     * We need to upgrade handler to be initialized with object with plugins property.
     *
     */
    upgradeCreateHandlerToPlugins(source, "handler");
    /**
     * Remove existing imports
     */
    removeImportFromSourceFile(source, "@webiny/api-file-manager/handlers/download");
    removeImportFromSourceFile(source, "@webiny/handler-aws");
    /**
     * Remove existing plugin
     */
    removePluginFromCreateHandler(source, "handler", new RegExp(/downloadFilePlugins\(\)/));

    /**
     * Then we need to insert handler-aws and download plugins import
     */
    insertImportToSourceFile({
        source,
        name: {
            createApiGatewayHandler: "createHandler"
        },

        moduleSpecifier: "@webiny/handler-aws"
    });
    insertImportToSourceFile({
        source,
        name: ["createDownloadFilePlugins"],

        moduleSpecifier: "@webiny/api-file-manager/handlers/download"
    });
    /**
     * And finally add plugins to the handler
     */

    addPluginToCreateHandler({
        source,
        handler: "handler",
        value: "createDownloadFilePlugins()"
    });
};

const updateManage = async ({ files, context, project }: UpdateParams): Promise<void> => {
    const indexFile = files.byName("fm/manage");
    if (!indexFile) {
        context.log.error(`Missing FileManager Manage index file. Skipping...`);
        return;
    }
    const source = project.getSourceFile(indexFile.path);
    if (!source) {
        context.log.error(`Missing Source of FileManager Manage index file. Skipping...`);
        return;
    }
    if (source.getText().match("createManageFilePlugins") !== null) {
        context.log.info(
            `It seems File Manager Manage index file was already upgraded. Skipping...`
        );
        return;
    }
    /**
     * We need to upgrade handler to be initialized with object with plugins property.
     *
     */
    upgradeCreateHandlerToPlugins(source, "handler", {
        debug: false
    });
    /**
     * Remove existing imports
     */
    removeImportFromSourceFile(source, "@webiny/api-file-manager/handlers/manage");
    removeImportFromSourceFile(source, "@webiny/handler-aws");
    /**
     * Remove existing plugin
     */
    removePluginFromCreateHandler(source, "handler", new RegExp(/manageFilePlugins\(\)/));

    /**
     * Then we need to insert handler-aws and download plugins import
     */
    insertImportToSourceFile({
        source,
        name: {
            createS3Handler: "createHandler"
        },

        moduleSpecifier: "@webiny/handler-aws"
    });
    insertImportToSourceFile({
        source,
        name: ["createManageFilePlugins"],

        moduleSpecifier: "@webiny/api-file-manager/handlers/manage"
    });
    /**
     * And finally add plugins to the handler
     */

    addPluginToCreateHandler({
        source,
        handler: "handler",
        value: "createManageFilePlugins()"
    });
};

/**
 import { createHandler } from "@webiny/handler-aws/raw";
 import { createTransformFilePlugins } from "@webiny/api-file-manager/handlers/transform";
 
 export const handler = createHandler({
    plugins: [createTransformFilePlugins()]
});
 
 */

const updateTransform = async ({ files, context, project }: UpdateParams): Promise<void> => {
    const indexFile = files.byName("fm/transform");
    if (!indexFile) {
        context.log.error(`Missing FileManager Transform index file. Skipping...`);
        return;
    }
    const source = project.getSourceFile(indexFile.path);
    if (!source) {
        context.log.error(`Missing Source of FileManager Transform index file. Skipping...`);
        return;
    }
    if (source.getText().match("createTransformFilePlugins") !== null) {
        context.log.info(
            `It seems File Manager Transform index file was already upgraded. Skipping...`
        );
        return;
    }
    /**
     * We need to upgrade handler to be initialized with object with plugins property.
     *
     */
    upgradeCreateHandlerToPlugins(source, "handler", {
        debug: false
    });
    /**
     * Remove existing imports
     */
    removeImportFromSourceFile(source, "@webiny/api-file-manager/handlers/transform");
    removeImportFromSourceFile(source, "@webiny/handler-aws");
    /**
     * Remove existing plugin
     */
    removePluginFromCreateHandler(source, "handler", new RegExp(/transformFilePlugins\(\)/));

    /**
     * Then we need to insert handler-aws and download plugins import
     */
    insertImportToSourceFile({
        source,
        name: {
            createS3Handler: "createHandler"
        },

        moduleSpecifier: "@webiny/handler-aws"
    });
    insertImportToSourceFile({
        source,
        name: ["createTransformFilePlugins"],

        moduleSpecifier: "@webiny/api-file-manager/handlers/transform"
    });
    /**
     * And finally add plugins to the handler
     */

    addPluginToCreateHandler({
        source,
        handler: "handler",
        value: "createTransformFilePlugins()"
    });
};
