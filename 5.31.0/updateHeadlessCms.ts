import { Project } from "ts-morph";
import { Context, IFiles } from "../types";
import {
    addPackagesToDependencies,
    addPluginToCreateHandler,
    findVersion,
    insertImportToSourceFile,
    isPre529Project,
    removeImportFromSourceFile,
    removePluginFromCreateHandler
} from "../utils";
import { createFilePath } from "./utils/paths";

interface Params {
    files: IFiles;
    project: Project;
    context: Context;
}
export const updateHeadlessCms = async (params: Params): Promise<void> => {
    await updateIndexFile(params);
    await updateTypesFile(params);
};

const updateIndexFile = async (params: Params): Promise<void> => {
    const { context, project, files } = params;
    const indexFile = files.byName("cms/index");
    if (!indexFile) {
        context.log.error(`Missing HeadlessCMS index file. Skipping...`);
        return;
    }
    const source = project.getSourceFile(indexFile.path);
    if (!source) {
        context.log.error(`Missing Source of HeadlessCMS index file. Skipping...`);
        return;
    }
    if (source.getText().match("createApiGatewayHandler") !== null) {
        context.log.info(`It seems HeadlessCMS index file was already upgraded. Skipping...`);
        return;
    }
    /**
     * We need to fix the handler first.
     */
    removeImportFromSourceFile(source, "@webiny/handler-aws");
    insertImportToSourceFile({
        source,
        name: {
            createApiGatewayHandler: "createHandler"
        },
        moduleSpecifier: "@webiny/handler-aws"
    });
    const cmsPath = createFilePath(context, "${cms}/package.json");
    addPackagesToDependencies(context, cmsPath, {
        // We actually remove these two packages since they do not exist anymore
        "@webiny/handler-http": null,
        "@webiny/handler-args": null
    });

    /**
     * Then we need to add the APW
     */
    if (isPre529Project(context) === false) {
        const version = findVersion(cmsPath) || context.version;

        addPackagesToDependencies(context, cmsPath, {
            "@webiny/api-apw": version,
            "@webiny/api-apw-scheduler-so-ddb": version
        });
        /**
         * Then we move onto APW
         */
        removeImportFromSourceFile(source, "@webiny/api-apw");
        removePluginFromCreateHandler(source, "handler", /createApwHeadlessCmsContext/);
        insertImportToSourceFile({
            source,
            name: ["createApwHeadlessCmsContext", "createApwGraphQL"],
            moduleSpecifier: "@webiny/api-apw"
        });

        insertImportToSourceFile({
            source,
            name: {
                createStorageOperations: "createApwSaStorageOperations"
            },
            moduleSpecifier: "@webiny/api-apw-scheduler-so-ddb"
        });

        addPluginToCreateHandler({
            source,
            before: "scaffoldsPlugins",
            value: "createApwGraphQL()"
        });
        addPluginToCreateHandler({
            source,
            after: "createApwGraphQL",
            value: "createApwHeadlessCmsContext({storageOperations: createApwSaStorageOperations({ documentClient })})"
        });
    }
};

const updateTypesFile = (params: Params): Promise<void> => {
    const { context, project, files } = params;
    const typesFile = files.byName("cms/types");
    if (!typesFile) {
        context.log.error(`Missing HeadlessCMS types file. Skipping...`);
        return;
    }
    const source = project.getSourceFile(typesFile.path);
    if (!source) {
        context.log.error(`Missing Source of HeadlessCMS types file. Skipping...`);
        return;
    }
    if (source.getText().match("HttpContext") === null) {
        context.log.info(`It seems HeadlessCMS types file was already upgraded. Skipping...`);
        return;
    }

    removeImportFromSourceFile(source, "@webiny/handler-http/types");
    removeImportFromSourceFile(source, "@webiny/handler-args/types");
    /**
     * Package dependencies were removed in updateIndexFile method
     */

    /**
     * Then we need to remove HttpContext and ArgsContext from the types file
     */
    let text = source.getText();

    text = text.replace("HttpContext,", "");
    text = text.replace("HttpContext", "");
    text = text.replace("ArgsContext,", "");
    text = text.replace("ArgsContext", "");

    source.replaceWithText(text);
};
