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

export const updateGraphQL = async (params: Params): Promise<void> => {
    await updateIndexFile(params);
    await updateTypesFile(params);
};

const updateIndexFile = async (params: Params): Promise<void> => {
    const { context, project, files } = params;
    const indexFile = files.byName("graphql/index");
    if (!indexFile) {
        context.log.error(`Missing GraphQL index file. Skipping...`);
        return;
    }
    const source = project.getSourceFile(indexFile.path);
    if (!source) {
        context.log.error(`Missing Source of GraphQL index file. Skipping...`);
        return;
    }
    if (source.getText().match("createApiGatewayHandler") !== null) {
        context.log.info(`It seems GraphQL index file was already upgraded. Skipping...`);
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

    const graphQLPath = createFilePath(context, "${graphql}/package.json");
    addPackagesToDependencies(context, graphQLPath, {
        "@webiny/handler-http": null,
        "@webiny/handler-args": null
    });

    /**
     * Then we need to add the APW
     * 5.29+ versions
     */
    if (isPre529Project(context) === false) {
        const version = findVersion(graphQLPath) || context.version;

        addPackagesToDependencies(context, graphQLPath, {
            "@webiny/api-apw": version,
            "@webiny/api-apw-scheduler-so-ddb": version
        });

        removePluginFromCreateHandler(source, "handler", /createApwPageBuilderContext/);
        removePluginFromCreateHandler(source, "handler", /createApwGraphQL/);

        insertImportToSourceFile({
            source,
            name: ["createApwPageBuilderContext", "createApwGraphQL"],
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
            value: "createApwPageBuilderContext({storageOperations: createApwSaStorageOperations({ documentClient })})"
        });
    }

    /**
     * There is a possibility that some process.env variables are not set as strings, so lets add those.
     * We will do that with plain string replace
     */
    let text = source.getText();

    text = text.replace(
        "render: process.env.PRERENDERING_RENDER_HANDLER",
        "render: String(process.env.PRERENDERING_RENDER_HANDLER)"
    );
    text = text.replace(
        "flush: process.env.PRERENDERING_FLUSH_HANDLER",
        "flush: String(process.env.PRERENDERING_FLUSH_HANDLER)"
    );
    text = text.replace(
        "add: process.env.PRERENDERING_QUEUE_ADD_HANDLER",
        "add: String(process.env.PRERENDERING_QUEUE_ADD_HANDLER)"
    );
    text = text.replace(
        "process: process.env.PRERENDERING_QUEUE_PROCESS_HANDLER",
        "process: String(process.env.PRERENDERING_QUEUE_PROCESS_HANDLER)"
    );

    source.replaceWithText(text);
};

const updateTypesFile = (params: Params): Promise<void> => {
    const { context, project, files } = params;
    const typesFile = files.byName("graphql/types");
    if (!typesFile) {
        context.log.error(`Missing GraphQL types file. Skipping...`);
        return;
    }
    const source = project.getSourceFile(typesFile.path);
    if (!source) {
        context.log.error(`Missing Source of GraphQL types file. Skipping...`);
        return;
    }
    if (source.getText().match("HttpContext") === null) {
        context.log.info(`It seems GraphQL types file was already upgraded. Skipping...`);
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
